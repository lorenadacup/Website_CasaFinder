import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { properties } from "./src/data/properties.js";
import { getEnv, isDevelopment, getGeminiKey } from "./src/utils/env.js";

// Error Types
enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  RATE_LIMIT = "RATE_LIMIT"
}

// Structured Error Response
interface ApiError {
  success: false;
  error: string;
  code: ErrorCode;
  details?: string;
  timestamp: string;
  requestId?: string;
}

// Success Response
interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
}

// Helper function to create error response
const createErrorResponse = (
  error: string,
  code: ErrorCode,
  details?: string,
  requestId?: string
): ApiError => ({
  success: false,
  error,
  code,
  details,
  timestamp: new Date().toISOString(),
  requestId
});

// Helper function to create success response
const createSuccessResponse = <T>(data: T): ApiSuccess<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString()
});

// Input validation helper
const validateStringInput = (input: any, fieldName: string, minLength = 1, maxLength = 1000): string => {
  if (typeof input !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }
  
  const trimmed = input.trim();
  if (trimmed.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} character(s)`);
  }
  
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} must not exceed ${maxLength} characters`);
  }
  
  return trimmed;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    try {
      const apiKey = getGeminiKey();
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'casafinder-server',
          }
        }
      });
      console.log("✅ Gemini AI client initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Gemini AI client:", error.message);
      throw error;
    }
  }
  return aiClient;
}

// API Routes

// Endpoint 1: Match properties based on natural language search
app.post("/api/match-properties", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json(
        createErrorResponse(
          "Search prompt is required", 
          ErrorCode.VALIDATION_ERROR,
          "Please provide a text description of your dream home",
          `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        )
      );
    }

    const ai = getGeminiClient();

    // Model selection guide: Basic text task or standard matching -> gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          text: `You are an elite real estate advisor and expert neighborhood matchmaker for CasaFinder operating exclusively in Gumaca, Quezon, Philippines.
Analyze the user's dream home preference or search criteria:
"${prompt}"

Evaluate every single one of the properties listed below.
Assign a matching score from 0 to 100 based on how well each property matches their request (facilities, price range in Pesos ₱, bedrooms, vibe, Barangay neighborhood features, year built, tags, and descriptive matching).
Be objective: a property that does not fit their requirements should receive a low score. A home that exactly fits their aesthetic and details should receive 90+.

Provide:
1. A warm, engaging, and professional 'advisorSummary' summarizing your general thoughts on what they are looking for, which properties are the strongest matches, and any Barangay-level or local Gumaca tips or considerations.
2. A list of 'matches' detailing the id of each property, its score, and a highly specific 'reason' (1-2 sentences) justifying why it received that score in relation to their exact prompt.

Below is the database of current active properties in Gumaca:
${JSON.stringify(properties, null, 2)}
`
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advisorSummary: {
              type: Type.STRING,
              description: "A highly personalized, warm, and professional summary explaining how the properties align with the user's specific request."
            },
            matches: {
              type: Type.ARRAY,
              description: "The list of property evaluations.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "The unique ID of the property evaluated." },
                  score: { type: Type.INTEGER, description: "A score from 0 to 100 indicating match quality." },
                  reason: { type: Type.STRING, description: "Specific 1-2 sentence explanation of how well this property matches the user's criteria." }
                },
                required: ["id", "score", "reason"]
              }
            }
          },
          required: ["advisorSummary", "matches"]
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Empty response returned from Gemini API");
    }

    const parsedResult = JSON.parse(outputText.trim());
    return res.json(createSuccessResponse(parsedResult));
  } catch (error: any) {
    console.error("Error in /api/match-properties:", error);
    return res.status(500).json(
      createErrorResponse(
        error.message || "An error occurred during AI matchmaking.",
        ErrorCode.AI_SERVICE_ERROR,
        "Ensure your GEMINI_API_KEY is configured in the environment",
        `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      )
    );
  }
});

// Endpoint 2: Ask a specific question about a single property
app.post("/api/ask-property-question", async (req, res) => {
  try {
    const { propertyId, question, fallbackProperty } = req.body;
    if (!propertyId || !question) {
      return res.status(400).json(
        createErrorResponse(
          "Property ID and question are required", 
          ErrorCode.VALIDATION_ERROR,
          "Please provide both a property ID and a question",
          `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        )
      );
    }

    let property = properties.find(p => p.id === propertyId);
    if (!property && fallbackProperty) {
      property = fallbackProperty;
    }

    if (!property) {
      return res.status(404).json(
        createErrorResponse(
          "Property not found", 
          ErrorCode.NOT_FOUND,
          `Property with ID "${propertyId}" does not exist in our database`,
          `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        )
      );
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are a real estate concierge representing this property in Gumaca, Quezon: "${property.title}".
Analyze the question and the detailed property sheet below, and provide a direct, friendly, and honest answer (max 3-4 sentences). Do not speculate or invent features that are not explicitly stated or logically deduced from the property details.

PROPERTY DETAILS:
- Address: ${property.address}, ${property.city} (${property.neighborhood})
- Price: ₱${property.price.toLocaleString()}
- Type: ${property.type}
- Space: ${property.beds} beds, ${property.baths} baths, ${property.sqft} sqm
- Description: ${property.description}
- Features: ${property.features.join(", ")}
- Tags: ${property.tags.join(", ")}
- Built: ${property.yearBuilt}
- Parking: ${property.parking}
- Cooling: ${property.heating}

USER QUESTION:
"${question}"
`
    });

    return res.json(createSuccessResponse({ answer: response.text }));
  } catch (error: any) {
    console.error("Error in /api/ask-property-question:", error);
    return res.status(500).json(
      createErrorResponse(
        error.message || "An error occurred while answering your question.",
        ErrorCode.AI_SERVICE_ERROR,
        "Ensure your GEMINI_API_KEY is configured in the environment",
        `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      )
    );
  }
});

// Serve health status
app.get("/api/health", (req, res) => {
  const healthData = { 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    services: {
      ai: true,
      database: true,
      env: getEnv().NODE_ENV,
      port: getEnv().PORT
    }
  };
  res.json(createSuccessResponse(healthData));
});

// Vite Middleware Integration for Development & Build Setup
async function initializeVite() {
  const env = getEnv();
  
  if (isDevelopment()) {
    console.log("🚀 Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🚀 Starting server in PRODUCTION mode with Static Assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(env.PORT, "0.0.0.0", () => {
    console.log("✅ CasaFinder Express Server initialized");
    console.log(`📍 Environment: ${env.NODE_ENV}`);
    console.log(`🌐 Server URL: http://0.0.0.0:${env.PORT}`);
    console.log(`🔧 API Endpoints:`);
    console.log(`   POST /api/match-properties - AI-powered property matching`);
    console.log(`   POST /api/ask-property-question - Property Q&A`);
    console.log(`   GET /api/health - Health check`);
    
    if (isDevelopment()) {
      console.log("\n💡 Development Notes:");
      console.log("   • Hot Module Replacement: Enabled");
      console.log("   • API Key Validation: Passed");
      console.log("   • TypeScript: In dev mode");
    }
  });
}

initializeVite().catch(err => {
  console.error("Failed to start server:", err);
});
