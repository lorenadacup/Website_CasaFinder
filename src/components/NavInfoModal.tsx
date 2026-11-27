import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Zap, MapPin, SlidersHorizontal, Star, GraduationCap, Shield,
  UserCircle, Globe, Building2, BadgeCheck, Users, Search, ClipboardList,
  CheckCircle, ArrowRight, BookOpen, Home, Laptop, Lock
} from "lucide-react";

export type NavInfoSection = "features" | "how-it-works" | "who-its-for" | null;

interface NavInfoModalProps {
  section: NavInfoSection;
  onClose: () => void;
  prefLanguage?: string;
  userRole?: "student" | "landlord" | "admin" | "guest";
}

// ─── Content ──────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: <Zap className="h-5 w-5" />,              color: "text-amber-400   bg-amber-400/10   border-amber-400/20",   title: "AI-Powered Matching",       desc: "Gemini AI scores every listing 0–100 based on your preferences, budget, and search criteria." },
  { icon: <MapPin className="h-5 w-5" />,            color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", title: "Interactive Map",            desc: "View property locations, school route lines, GPS position, and barangay boundaries on a live map." },
  { icon: <SlidersHorizontal className="h-5 w-5" />, color: "text-teal-400    bg-teal-400/10    border-teal-400/20",    title: "Smart Filters",             desc: "Filter by barangay, price range, room type, and gender policy to find the perfect match." },
  { icon: <Star className="h-5 w-5" />,              color: "text-yellow-400  bg-yellow-400/10  border-yellow-400/20",  title: "Reviews & Ratings",         desc: "Rate properties 1–5 stars, leave comments, and read feedback from fellow students." },
  { icon: <GraduationCap className="h-5 w-5" />,     color: "text-sky-400     bg-sky-400/10     border-sky-400/20",     title: "School Distance Finder",    desc: "See walking and tricycle distances to SLSU, EQC, PIAT, GNHS, and Holy Child for every property." },
  { icon: <Building2 className="h-5 w-5" />,         color: "text-orange-400  bg-orange-400/10  border-orange-400/20",  title: "Post Listings",             desc: "Landlords can add boarding houses or apartments with photos, amenities, pricing, and location pin." },
  { icon: <Shield className="h-5 w-5" />,            color: "text-indigo-400  bg-indigo-400/10  border-indigo-400/20",  title: "Verified Listings Only",    desc: "All properties shown are LGU-approved with valid Mayor's Permit and safety document badges." },
  { icon: <Globe className="h-5 w-5" />,             color: "text-purple-400  bg-purple-400/10  border-purple-400/20",  title: "Bilingual Support",         desc: "Switch between English and Filipino (Tagalog) anytime from your profile settings." },
  { icon: <BadgeCheck className="h-5 w-5" />,        color: "text-lime-400    bg-lime-400/10    border-lime-400/20",    title: "Permit Verification",       desc: "Verified landlords display Business Permit, Barangay Clearance, BFP Fire Safety, and DTI badges." },
  { icon: <Lock className="h-5 w-5" />,              color: "text-rose-400    bg-rose-400/10    border-rose-400/20",    title: "Secure Accounts",           desc: "Password protection, 2-Factor Authentication toggle, active session tracking, and account PIN." },
];

const HOW_IT_WORKS_TENANT = [
  {
    step: "01", icon: <UserCircle className="h-6 w-6" />, color: "from-pink-500 to-rose-600",
    title: "Gumawa ng Account",
    desc: "Mag-sign up bilang Student/Tenant. Punan ang iyong profile sa onboarding — tatagal lang ng 2 minuto.",
  },
  {
    step: "02", icon: <Search className="h-6 w-6" />, color: "from-violet-500 to-indigo-600",
    title: "Maghanap ng Boarding House",
    desc: "I-browse ang mga listing na naka-filter sa barangay, presyo, uri, at gender policy. Gamitin ang AI Matching para makuha ang personalized na score.",
  },
  {
    step: "03", icon: <MapPin className="h-6 w-6" />, color: "from-emerald-500 to-teal-600",
    title: "Tingnan sa Mapa",
    desc: "Buksan ang Interactive Map para makita ang eksaktong lokasyon ng property, distansya sa iyong eskwelahan, at mga landmark sa paligid.",
  },
  {
    step: "04", icon: <ClipboardList className="h-6 w-6" />, color: "from-amber-500 to-orange-600",
    title: "Suriin ang Detalye at Reviews",
    desc: "Buksan ang listing para makita ang buong amenities, profile ng landlord, permit badges, reviews ng mga estudyante, at paraan ng pakikipag-ugnayan.",
  },
  {
    step: "05", icon: <Laptop className="h-6 w-6" />, color: "from-sky-500 to-blue-600",
    title: "Makipag-ugnayan sa Landlord",
    desc: "Mag-send ng pre-made SMS o buksan ang Facebook Messenger direkta mula sa listing — walang manual na pag-type.",
  },
  {
    step: "06", icon: <CheckCircle className="h-6 w-6" />, color: "from-lime-500 to-green-600",
    title: "Lumipat at Mag-iwan ng Review",
    desc: "Pagkatapos manirahan, i-rate ang property 1–5 stars at mag-iwan ng komento para matulungan ang mga susunod na estudyante.",
  },
];

const HOW_IT_WORKS_LANDLORD = [
  {
    step: "01", icon: <UserCircle className="h-6 w-6" />, color: "from-blue-500 to-indigo-600",
    title: "Mag-sign Up bilang Landlord",
    desc: "Gumawa ng account bilang Landlord. I-fill in ang iyong business name, address, at contact info sa onboarding.",
  },
  {
    step: "02", icon: <Shield className="h-6 w-6" />, color: "from-amber-500 to-orange-600",
    title: "Hintayin ang Approval ng Admin",
    desc: "Ang iyong landlord account ay ire-review ng LGU Housing Admin. Makakatanggap ka ng notification kapag na-approve na.",
  },
  {
    step: "03", icon: <Building2 className="h-6 w-6" />, color: "from-emerald-500 to-teal-600",
    title: "Mag-post ng Listing",
    desc: "I-click ang 'Post Housing' button. Punan ang lahat ng detalye — pangalan, presyo, amenities, litrato, at i-pin ang eksaktong lokasyon sa mapa.",
  },
  {
    step: "04", icon: <ClipboardList className="h-6 w-6" />, color: "from-violet-500 to-purple-600",
    title: "Hintayin ang Approval ng Listing",
    desc: "Ang bawat listing ay ire-review ng admin bago ipakita sa publiko. Makakatanggap ka ng notification kapag na-approve o na-reject.",
  },
  {
    step: "05", icon: <Star className="h-6 w-6" />, color: "from-pink-500 to-rose-600",
    title: "Pamahalaan ang iyong mga Listing",
    desc: "Maaari mong i-edit o i-delete ang iyong mga listing anumang oras. I-update ang presyo, photos, at amenities kung kinakailangan.",
  },
  {
    step: "06", icon: <CheckCircle className="h-6 w-6" />, color: "from-lime-500 to-green-600",
    title: "Makipag-ugnayan sa mga Tenant",
    desc: "Makatatanggap ka ng mga mensahe mula sa mga interesadong tenant sa pamamagitan ng SMS o Facebook Messenger.",
  },
];

const WHO_ITS_FOR = [
  {
    emoji: "🎓",
    color: "from-pink-600 via-rose-600 to-indigo-600",
    border: "border-pink-300/30",
    title: "Students & Tenants",
    subtitle: "Looking for housing near campus",
    points: [
      "Students enrolled at SLSU, EQC, PIAT, GNHS, or Holy Child",
      "Anyone looking for affordable boarding houses or apartments in Gumaca",
      "Tenants who want verified, safe, and LGU-approved accommodations",
      "Students who want to compare properties by distance, price, and amenities",
    ],
  },
  {
    emoji: "🏠",
    color: "from-blue-600 via-indigo-600 to-violet-600",
    border: "border-blue-300/30",
    title: "Landlords & Property Owners",
    subtitle: "Listing rooms and apartments",
    points: [
      "Boarding house and apartment owners in Gumaca, Quezon",
      "Landlords who want to reach student tenants directly",
      "Property owners with valid LGU permits and safety certifications",
      "Owners who want a digital platform to manage their listings",
    ],
  },
  {
    emoji: "🛡️",
    color: "from-amber-600 via-orange-600 to-red-600",
    border: "border-amber-300/30",
    title: "LGU Housing Administrators",
    subtitle: "Managing and verifying listings",
    points: [
      "Municipal Housing Regulatory Officers of Gumaca",
      "Campus Housing Coordinators of SLSU and partner schools",
      "Admins who review and approve landlord accounts and listings",
      "Officials who monitor housing compliance and student welfare",
    ],
  },
];

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function NavInfoModal({ section, onClose, prefLanguage = "english", userRole }: NavInfoModalProps) {
  const isTagalog = prefLanguage === "tagalog";

  // Choose How It Works content based on role
  const HOW_IT_WORKS = userRole === "landlord" ? HOW_IT_WORKS_LANDLORD : HOW_IT_WORKS_TENANT;

  const title = {
    "features":     isTagalog ? "Mga Features ng CasaFinder" : "CasaFinder Features",
    "how-it-works": isTagalog ? "Paano Gamitin ang CasaFinder" : "How It Works",
    "who-its-for":  isTagalog ? "Para Kanino ang CasaFinder?" : "Who It's For",
  }[section ?? "features"] ?? "";

  const subtitle = {
    "features":     "Everything you need to find or list student housing in Gumaca.",
    "how-it-works": "Get started in minutes — from sign-up to finding your room.",
    "who-its-for":  "CasaFinder is built for the Gumaca student housing community.",
  }[section ?? "features"] ?? "";

  const headerGradient = {
    "features":     "from-violet-900 via-purple-900 to-indigo-900",
    "how-it-works": "from-emerald-900 via-teal-900 to-cyan-900",
    "who-its-for":  "from-rose-900 via-pink-900 to-purple-900",
  }[section ?? "features"] ?? "from-violet-900 to-indigo-900";

  return (
    <AnimatePresence>
      {section && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-md">
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="relative z-10 w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${headerGradient} p-6 text-white relative overflow-hidden shrink-0`}>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-display">{title}</h2>
                  <p className="text-sm text-white/70 mt-1">{subtitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-all shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">

              {/* FEATURES */}
              {section === "features" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FEATURES.map((f, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3.5 rounded-2xl border bg-white dark:bg-stone-800/50 border-stone-200 dark:border-stone-700/50`}>
                      <div className={`p-2 rounded-xl border shrink-0 ${f.color}`}>
                        {f.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{f.title}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* HOW IT WORKS */}
              {section === "how-it-works" && (
                <div className="space-y-3">
                  {HOW_IT_WORKS.map((step, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/50">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                        {step.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-stone-400 dark:text-stone-500 font-mono">STEP {step.step}</span>
                        </div>
                        <p className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-0.5">{step.title}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">{step.desc}</p>
                      </div>
                      {i < HOW_IT_WORKS.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-stone-300 dark:text-stone-600 shrink-0 mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* WHO IT'S FOR */}
              {section === "who-its-for" && (
                <div className="space-y-4">
                  {WHO_ITS_FOR.map((group, i) => (
                    <div key={i} className={`rounded-2xl border ${group.border} bg-white dark:bg-stone-800/50 overflow-hidden`}>
                      <div className={`bg-gradient-to-r ${group.color} px-5 py-3.5 flex items-center gap-3`}>
                        <span className="text-2xl">{group.emoji}</span>
                        <div>
                          <p className="text-sm font-bold text-white">{group.title}</p>
                          <p className="text-[11px] text-white/70">{group.subtitle}</p>
                        </div>
                      </div>
                      <ul className="p-4 space-y-2">
                        {group.points.map((point, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-300">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-stone-100 dark:border-stone-800 shrink-0 flex justify-end">
              <button
                onClick={onClose}
                className="bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 dark:hover:bg-stone-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95"
              >
                Got it ✓
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
