// Portal Preset Specifications — easily editable for admin customization

export interface ImageSpec {
  width: number;
  height: number;
  min_kb: number;
  max_kb: number;
  format: "jpg" | "jpeg" | "png";
  background: "white" | "transparent" | "blue";
  dpi?: number;
  notes?: string;
}

export interface PortalPreset {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  photo: ImageSpec;
  signature: ImageSpec;
}

export const PORTAL_PRESETS: Record<string, PortalPreset> = {
  ssc: {
    id: "ssc",
    label: "SSC (Staff Selection Commission)",
    icon: "🏛️",
    color: "#1a3c6e",
    description: "CGL, CHSL, MTS & all SSC exams",
    photo: {
      width: 100,
      height: 120,
      min_kb: 20,
      max_kb: 50,
      format: "jpg",
      background: "white",
      notes: "Recent passport size photo with white background",
    },
    signature: {
      width: 140,
      height: 60,
      min_kb: 10,
      max_kb: 20,
      format: "jpg",
      background: "white",
      notes: "Black ink signature on white paper",
    },
  },
  ibps: {
    id: "ibps",
    label: "IBPS (Banking Personnel Selection)",
    icon: "🏦",
    color: "#0d5c3d",
    description: "PO, Clerk, SO & RRB exams",
    photo: {
      width: 200,
      height: 230,
      min_kb: 20,
      max_kb: 50,
      format: "jpg",
      background: "white",
      notes: "Plain light background, looking straight at camera",
    },
    signature: {
      width: 140,
      height: 60,
      min_kb: 10,
      max_kb: 20,
      format: "jpg",
      background: "white",
      notes: "Signature in black or dark blue ink",
    },
  },
  railway_rrb: {
    id: "railway_rrb",
    label: "Railway RRB (Railway Recruitment Board)",
    icon: "🚂",
    color: "#8b1a1a",
    description: "NTPC, Group D, ALP & all RRB exams",
    photo: {
      width: 150,
      height: 180,
      min_kb: 15,
      max_kb: 40,
      format: "jpg",
      background: "white",
      notes: "Front-facing, ears visible, no caps/goggles",
    },
    signature: {
      width: 100,
      height: 60,
      min_kb: 10,
      max_kb: 40,
      format: "jpg",
      background: "white",
      notes: "Signature in running handwriting",
    },
  },
  upsc: {
    id: "upsc",
    label: "UPSC (Union Public Service Commission)",
    icon: "⚖️",
    color: "#4a1259",
    description: "IAS, IPS, IFS & all UPSC exams",
    photo: {
      width: 200,
      height: 300,
      min_kb: 20,
      max_kb: 300,
      format: "jpg",
      background: "white",
      notes: "Formal attire, white/light background",
    },
    signature: {
      width: 250,
      height: 100,
      min_kb: 20,
      max_kb: 300,
      format: "jpg",
      background: "white",
      notes: "Clear black ink on white paper",
    },
  },
  state_psc: {
    id: "state_psc",
    label: "State PSC (Public Service Commission)",
    icon: "🗺️",
    color: "#1a520d",
    description: "All state-level competitive exams",
    photo: {
      width: 150,
      height: 200,
      min_kb: 20,
      max_kb: 100,
      format: "jpg",
      background: "white",
      notes: "Passport size, white background",
    },
    signature: {
      width: 140,
      height: 60,
      min_kb: 10,
      max_kb: 40,
      format: "jpg",
      background: "white",
      notes: "Ink signature on white background",
    },
  },
  nta: {
    id: "nta",
    label: "NTA (JEE / NEET / CUET)",
    icon: "📚",
    color: "#c44b00",
    description: "JEE Main, NEET-UG, CUET, UGC-NET",
    photo: {
      width: 200,
      height: 230,
      min_kb: 10,
      max_kb: 200,
      format: "jpg",
      background: "white",
      notes: "White/off-white plain background",
    },
    signature: {
      width: 140,
      height: 60,
      min_kb: 10,
      max_kb: 30,
      format: "jpg",
      background: "white",
      notes: "Signature in black ink",
    },
  },
  custom: {
    id: "custom",
    label: "Custom / Manual Mode",
    icon: "⚙️",
    color: "#374151",
    description: "Set your own dimensions and file size",
    photo: {
      width: 200,
      height: 230,
      min_kb: 20,
      max_kb: 50,
      format: "jpg",
      background: "white",
    },
    signature: {
      width: 140,
      height: 60,
      min_kb: 10,
      max_kb: 20,
      format: "jpg",
      background: "white",
    },
  },
};

export const PRESET_LIST = Object.values(PORTAL_PRESETS);
