/**
 * Environment Configuration and Validation
 * Validates required environment variables and provides typed access
 */

interface Environment {
  GEMINI_API_KEY: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DISABLE_HMR: boolean;
  GOOGLE_MAPS_API_KEY?: string;
}

// Default values for development
const defaults: Partial<Environment> = {
  NODE_ENV: 'development',
  PORT: 3000,
  DISABLE_HMR: false
};

// Validation rules for environment variables
const validationRules = {
  GEMINI_API_KEY: {
    required: true,
    type: 'string' as const,
    minLength: 10,
    maxLength: 200,
    pattern: /^[A-Za-z0-9._-]+$/,
    errorMessage: 'GEMINI_API_KEY must be a valid API key (alphanumeric with dots, dashes, underscores)'
  },
  NODE_ENV: {
    required: true,
    type: 'string' as const,
    allowedValues: ['development', 'production', 'test'] as const,
    errorMessage: 'NODE_ENV must be one of: development, production, test'
  },
  PORT: {
    required: true,
    type: 'number' as const,
    min: 1,
    max: 65535,
    errorMessage: 'PORT must be a number between 1 and 65535'
  },
  DISABLE_HMR: {
    required: false,
    type: 'boolean' as const,
    errorMessage: 'DISABLE_HMR must be true or false'
  },
  GOOGLE_MAPS_API_KEY: {
    required: false,
    type: 'string' as const,
    pattern: /^[A-Za-z0-9_-]+$/,
    errorMessage: 'GOOGLE_MAPS_API_KEY must be alphanumeric with dashes and underscores'
  }
};

/**
 * Validates a single environment variable
 */
function validateEnvVariable<T>(
  key: string,
  value: any,
  rules: typeof validationRules[keyof typeof validationRules]
): T {
  // Use default if value is undefined
  if (value === undefined && defaults[key as keyof Environment] !== undefined) {
    return defaults[key as keyof Environment] as T;
  }

  // Check required
  if (rules.required && (value === undefined || value === '')) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  // Skip validation if not required and not provided
  if (!rules.required && (value === undefined || value === '')) {
    return undefined as T;
  }

  // Type checking
  if (rules.type === 'number') {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      throw new Error(`${key} must be a number`);
    }
    if (rules.min !== undefined && numValue < rules.min) {
      throw new Error(`${key} must be at least ${rules.min}`);
    }
    if (rules.max !== undefined && numValue > rules.max) {
      throw new Error(`${key} must be at most ${rules.max}`);
    }
    return numValue as T;
  }

  if (rules.type === 'boolean') {
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true' || lowerValue === '1') return true as T;
      if (lowerValue === 'false' || lowerValue === '0') return false as T;
    }
    return Boolean(value) as T;
  }

  if (rules.type === 'string') {
    const strValue = String(value).trim();
    
    // Check allowed values
    if (rules.allowedValues && !rules.allowedValues.includes(strValue as any)) {
      throw new Error(`${key} must be one of: ${rules.allowedValues.join(', ')}`);
    }

    // Check length constraints
    if (rules.minLength && strValue.length < rules.minLength) {
      throw new Error(`${key} must be at least ${rules.minLength} characters`);
    }
    if (rules.maxLength && strValue.length > rules.maxLength) {
      throw new Error(`${key} must be at most ${rules.maxLength} characters`);
    }

    // Check pattern
    if (rules.pattern && !rules.pattern.test(strValue)) {
      throw new Error(rules.errorMessage || `Invalid format for ${key}`);
    }

    return strValue as T;
  }

  return value as T;
}

/**
 * Validates and returns all environment variables
 */
export function validateEnvironment(): Environment {
  const env = process.env;
  const validated: Partial<Environment> = {};

  try {
    // Validate each environment variable
    for (const [key, rules] of Object.entries(validationRules)) {
      const envKey = key as keyof Environment;
      const value = env[envKey];
      
      try {
        const validatedValue = validateEnvVariable(
          key,
          value,
          rules as typeof validationRules[keyof typeof validationRules]
        );
        
        if (validatedValue !== undefined) {
          validated[envKey] = validatedValue;
        }
      } catch (error) {
        console.error(`Environment validation error for ${key}:`, error.message);
        throw error;
      }
    }

    // Additional cross-validation
    if (validated.NODE_ENV === 'production' && !validated.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required in production mode');
    }

    // Log successful validation (development only)
    if (validated.NODE_ENV === 'development') {
      console.log('✅ Environment validation passed');
      console.log('📋 Environment configuration:');
      console.log(`   NODE_ENV: ${validated.NODE_ENV}`);
      console.log(`   PORT: ${validated.PORT}`);
      console.log(`   GEMINI_API_KEY: ${validated.GEMINI_API_KEY ? '✓ Set' : '✗ Not set'}`);
      console.log(`   GOOGLE_MAPS_API_KEY: ${validated.GOOGLE_MAPS_API_KEY ? '✓ Set' : '✗ Not set'}`);
    }

    return validated as Environment;
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    console.error('\n📋 Required environment variables:');
    console.error('   GEMINI_API_KEY - Your Gemini AI API key');
    console.error('   NODE_ENV - development, production, or test');
    console.error('   PORT - Server port (default: 3000)');
    console.error('\n💡 Optional environment variables:');
    console.error('   GOOGLE_MAPS_API_KEY - For Google Maps integration');
    console.error('   DISABLE_HMR - Set to true to disable hot module replacement');
    
    throw error;
  }
}

/**
 * Get validated environment variables
 */
let cachedEnv: Environment | null = null;

export function getEnv(): Environment {
  if (!cachedEnv) {
    cachedEnv = validateEnvironment();
  }
  return cachedEnv;
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Check if Google Maps API key is available
 */
export function hasGoogleMapsKey(): boolean {
  return !!getEnv().GOOGLE_MAPS_API_KEY;
}

/**
 * Get Google Maps API key (throws if not available)
 */
export function getGoogleMapsKey(): string {
  const key = getEnv().GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error('GOOGLE_MAPS_API_KEY is not configured. Please add it to your .env file.');
  }
  return key;
}

/**
 * Get Gemini API key
 */
export function getGeminiKey(): string {
  return getEnv().GEMINI_API_KEY;
}