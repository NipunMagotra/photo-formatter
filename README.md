# FormReady — Govt Portal Photo Auto-Formatter

> Automatically resize, compress, convert, validate and export candidate photos & signatures to exact Indian government exam portal specifications — in under 5 seconds.

---

## ✨ Features

| Feature | Details |
|--------|---------|
| **Portal Presets** | SSC, IBPS, RRB, UPSC, State PSC, NTA, Custom |
| **Auto Processing** | Exact pixel resize, JPEG conversion, white background enforcement |
| **Smart Compression** | Binary-search algorithm to hit exact KB range every time |
| **Validation Engine** | Checks dimensions, file size, and format before download |
| **Session History** | Last 5 files accessible for re-download |
| **Admin Panel** | Edit portal presets at `/admin` |
| **Privacy First** | 100% in-browser — no files ever uploaded to a server |
| **Zero Login** | Works instantly, no registration |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone or unzip the project
cd govt-photo-formatter

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Portal Specifications

| Portal | Photo | Signature |
|--------|-------|-----------|
| SSC | 100×120 px, 20-50 KB | 140×60 px, 10-20 KB |
| IBPS | 200×230 px, 20-50 KB | 140×60 px, 10-20 KB |
| Rail RRB | 150×180 px, 15-40 KB | 100×60 px, 10-40 KB |
| UPSC | 200×300 px, 20-300 KB | 250×100 px, 20-300 KB |
| State PSC | 150×200 px, 20-100 KB | 140×60 px, 10-40 KB |
| NTA | 200×230 px, 10-200 KB | 140×60 px, 10-30 KB |

---

## 🏗 Project Structure

```
src/
├── app/
│   ├── globals.css          # Design system (tokens, components)
│   ├── layout.tsx           # Root layout with SEO metadata
│   ├── page.tsx             # Main app page
│   └── admin/
│       └── page.tsx         # Admin preset editor
├── components/
│   ├── DropZone.tsx         # Drag & drop upload zone
│   ├── PresetSelector.tsx   # Portal card selector
│   ├── SpecPanel.tsx        # Spec display + custom inputs
│   ├── ResultCard.tsx       # Output + download card
│   ├── SessionHistory.tsx   # Session history list
│   └── Toast.tsx            # Global toast notifications
└── lib/
    ├── presets.ts           # Portal preset data (edit here)
    ├── imageProcessor.ts    # Canvas-based image engine
    └── utils.ts             # Utility helpers
```

---

## 🎨 Design System

Follows the **60-30-10 colour rule**:
- **60%** — Deep navy `#0f2952` (dominant)  
- **30%** — Off-white / light gray (surfaces)  
- **10%** — Saffron orange `#f97316` (accent / CTA)

Contrast ratios exceed **4.5:1** for all normal text per WCAG 2.1 AA.

---

## ⚙️ Adding/Editing Presets

Edit `src/lib/presets.ts` — the `PORTAL_PRESETS` object. Each preset is:

```typescript
{
  id: "your_portal",
  label: "Your Portal Name",
  icon: "🏛️",
  photo: { width, height, min_kb, max_kb, format: "jpg", background: "white" },
  signature: { width, height, min_kb, max_kb, format: "jpg", background: "white" }
}
```

Or use the live admin UI at `/admin`.

---

## 🚢 Deployment

### Vercel (Recommended)
```bash
npx vercel deploy
```

### Railway (Backend)
```bash
# If adding server-side Sharp processing in future
railway up
```

---

## 🗺 Roadmap

- [x] Client-side image processing
- [x] 6 portal presets
- [x] Validation engine
- [x] Session history
- [x] Admin panel
- [ ] Server-side Sharp processing (higher accuracy)
- [ ] Batch mode (50 images)
- [ ] WhatsApp bot integration
- [ ] Electron desktop app
- [ ] Remove.bg API background removal

---

## 📄 License

MIT © 2026 FormReady
