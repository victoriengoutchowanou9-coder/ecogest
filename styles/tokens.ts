/**
 * Design Tokens for ECODUC (GESTIO 229)
 * Centralizes theme variables, colors, typography scales and business statuses
 */

export const DESIGN_TOKENS = {
  colors: {
    // Primary deep blue
    primary: {
      default: "#0f2b5c",
      hover: "#0a1d40",
      light: "#1e3a8a",
      subtle: "#f0f4f9",
    },
    accent: {
      default: "#2563eb",
      hover: "#1d4ed8",
    },
    // Neutrals
    neutral: {
      bgPage: "#f8fafc",
      bgCard: "#ffffff",
      border: "#e2e8f0",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
      textMuted: "#94a3b8",
    },
    // Semantic statuses
    status: {
      paid: {
        bg: "#dcfce7",
        text: "#15803d",
        border: "#86efac",
        label: "Payé",
      },
      partial: {
        bg: "#ffedd5",
        text: "#c2410c",
        border: "#fdba74",
        label: "Partiel",
      },
      unpaid: {
        bg: "#fee2e2",
        text: "#b91c1c",
        border: "#fca5a5",
        label: "Impayé",
      },
      late: {
        bg: "#fef2f2",
        text: "#991b1b",
        border: "#f87171",
        label: "En retard",
      },
      draft: {
        bg: "#f1f5f9",
        text: "#475569",
        border: "#cbd5e1",
        label: "Brouillon",
      },
      validated: {
        bg: "#ecfdf5",
        text: "#047857",
        border: "#a7f3d0",
        label: "Validé",
      },
      locked: {
        bg: "#f3f4f6",
        text: "#374151",
        border: "#d1d5db",
        label: "Verrouillé",
      },
      info: {
        bg: "#e0f2fe",
        text: "#0369a1",
        border: "#7dd3fc",
        label: "Information",
      },
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    fontSize: {
      titleLg: "24px",
      titleMd: "20px",
      titleSm: "18px",
      body: "16px",
      smallMobile: "14px", // Minimum mobile size
    },
  },
  sizing: {
    minTouchTarget: "44px", // Minimum tap target for mobile accessibility
    sidebarWidth: "260px",
    topbarHeight: "64px",
  },
} as const;

export type SchoolStatus =
  | "PAID"
  | "PARTIAL"
  | "UNPAID"
  | "LATE"
  | "DRAFT"
  | "VALIDATED"
  | "LOCKED"
  | "INFO";
