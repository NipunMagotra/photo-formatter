"use client";

import { useState, useCallback } from "react";
import DropZone from "@/components/DropZone";
import PresetSelector from "@/components/PresetSelector";
import SpecPanel from "@/components/SpecPanel";
import ResultCard from "@/components/ResultCard";
import SessionHistory, { HistoryEntry } from "@/components/SessionHistory";
import ToastContainer, { showToast } from "@/components/Toast";
import DocumentFormatter from "@/components/DocumentFormatter";
import { PORTAL_PRESETS } from "@/lib/presets";
import { processImage, ProcessingResult } from "@/lib/imageProcessor";
import { ImageSpec } from "@/lib/presets";

type Step = "upload" | "preset" | "results";
type MainTab = "photo-sig" | "documents";

interface Results {
  photo?: ProcessingResult;
  signature?: ProcessingResult;
}

let historyCounter = 0;

export default function HomePage() {
  // Main tab
  const [mainTab, setMainTab] = useState<MainTab>("photo-sig");

  // Files
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [sigPreview, setSigPreview] = useState<string | null>(null);

  // Preset
  const [selectedPreset, setSelectedPreset] = useState("ssc");

  // Custom overrides
  const [customPhoto, setCustomPhoto] = useState<Partial<ImageSpec>>({});
  const [customSig, setCustomSig] = useState<Partial<ImageSpec>>({});

  // Processing
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  // Results
  const [results, setResults] = useState<Results>({});
  const [step, setStep] = useState<Step>("upload");

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const preset = PORTAL_PRESETS[selectedPreset];
  const isCustom = selectedPreset === "custom";

  const effectivePhoto: ImageSpec = {
    ...preset.photo,
    ...(isCustom ? customPhoto : {}),
  };
  const effectiveSig: ImageSpec = {
    ...preset.signature,
    ...(isCustom ? customSig : {}),
  };

  const handlePhotoFile = useCallback((f: File) => {
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  }, []);

  const handleSigFile = useCallback((f: File) => {
    setSigFile(f);
    setSigPreview(URL.createObjectURL(f));
  }, []);

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const removeSig = () => {
    setSigFile(null);
    setSigPreview(null);
  };

  const canGenerate = (photoFile || sigFile) && !processing;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setProcessing(true);
    setProgress(0);
    setResults({});

    try {
      const newResults: Results = {};
      const newHistory: HistoryEntry[] = [];

      if (photoFile) {
        setProgressLabel("Processing photo…");
        const r = await processImage(photoFile, effectivePhoto, (pct) =>
          setProgress(Math.round(pct * 0.5))
        );
        newResults.photo = r;
        newHistory.push({
          id: ++historyCounter,
          label: `${preset.id.toUpperCase()} Photo`,
          type: "photo",
          presetId: preset.id,
          result: r,
          timestamp: new Date(),
        });
        if (r.valid) showToast("Photo formatted successfully!", "success");
        else showToast("Photo processed but check validation.", "warning");
      }

      if (sigFile) {
        setProgressLabel("Processing signature…");
        const r = await processImage(sigFile, effectiveSig, (pct) =>
          setProgress(50 + Math.round(pct * 0.5))
        );
        newResults.signature = r;
        newHistory.push({
          id: ++historyCounter,
          label: `${preset.id.toUpperCase()} Signature`,
          type: "signature",
          presetId: preset.id,
          result: r,
          timestamp: new Date(),
        });
        if (r.valid) showToast("Signature formatted successfully!", "success");
        else showToast("Signature processed but check validation.", "warning");
      }

      setResults(newResults);
      setHistory((prev) => [...prev, ...newHistory].slice(-5));
      setStep("results");
    } catch (err) {
      console.error(err);
      showToast("Processing failed. Please try again.", "error");
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };

  const handleReset = () => {
    setPhotoFile(null);
    setSigFile(null);
    setPhotoPreview(null);
    setSigPreview(null);
    setResults({});
    setStep("upload");
    setProgress(0);
  };

  const currentStep = step === "results" ? 3 : photoFile || sigFile ? 2 : 1;

  return (
    <>
      {/* ── HEADER ── */}
      <header className="site-header" role="banner">
        <div className="header-logo">
          <div className="header-logo__icon" aria-hidden="true">📋</div>
          <div>
            <div className="header-logo__name">
              Form<span>Ready</span>
            </div>
            <div className="header-tagline">Govt Portal Photo &amp; Document Formatter</div>
          </div>
        </div>
        <span className="header-badge">Free MVP</span>
      </header>

      {/* ── HERO ── */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span aria-hidden="true">⚡</span> Instant formatting · No sign-up required
          </div>
          <h1 className="hero-title" id="hero-title">
            Format Photos, Signatures &amp;{" "}
            <span className="accent">Documents</span> for Any Govt Portal
          </h1>
          <p className="hero-subtitle">
            SSC · IBPS · RRB · UPSC · State PSC · NTA<br />
            Auto-resize, compress &amp; validate photos, signatures, and scanned
            documents in seconds — not minutes.
          </p>
          <div className="hero-stats" role="list">
            <div className="hero-stat" role="listitem">
              <span className="hero-stat__number">&lt;5s</span>
              <span className="hero-stat__label">Processing time</span>
            </div>
            <div className="hero-stat" role="listitem">
              <span className="hero-stat__number">6+</span>
              <span className="hero-stat__label">Portal presets</span>
            </div>
            <div className="hero-stat" role="listitem">
              <span className="hero-stat__number">7</span>
              <span className="hero-stat__label">Doc types</span>
            </div>
            <div className="hero-stat" role="listitem">
              <span className="hero-stat__number">0</span>
              <span className="hero-stat__label">Files stored</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN ── */}
      <main className="main-wrapper" id="main-content">

        {/* ══ MAIN TABS ══ */}
        <div className="main-tabs" role="tablist" aria-label="Formatter mode" style={{ marginBottom: "var(--space-8)" }}>
          <button
            id="tab-photo-sig"
            className={`main-tab${mainTab === "photo-sig" ? " active" : ""}`}
            role="tab"
            aria-selected={mainTab === "photo-sig"}
            aria-controls="panel-photo-sig"
            onClick={() => setMainTab("photo-sig")}
          >
            <span aria-hidden="true">📷</span> Photo &amp; Signature
          </button>
          <button
            id="tab-documents"
            className={`main-tab${mainTab === "documents" ? " active" : ""}`}
            role="tab"
            aria-selected={mainTab === "documents"}
            aria-controls="panel-documents"
            onClick={() => setMainTab("documents")}
          >
            <span aria-hidden="true">📄</span> Documents
          </button>
        </div>

        {/* ══ PHOTO & SIGNATURE PANEL ══ */}
        <div
          id="panel-photo-sig"
          role="tabpanel"
          aria-labelledby="tab-photo-sig"
          hidden={mainTab !== "photo-sig"}
        >
          {/* Step progress bar */}
          <nav className="steps-bar" aria-label="Progress steps">
            {[
              { num: 1, label: "Upload" },
              { num: 2, label: "Select Portal" },
              { num: 3, label: "Download" },
            ].map((s, i) => (
              <div
                key={s.num}
                className={`step-item${currentStep > s.num ? " done" : ""}${currentStep === s.num ? " active" : ""
                  }`}
                style={{ width: i < 2 ? "200px" : "auto" }}
              >
                <div className="step-num">
                  {currentStep > s.num ? "✓" : s.num}
                </div>
                <div className="step-label">{s.label}</div>
              </div>
            ))}
          </nav>

          {/* STEP 1: UPLOAD */}
          <section className="card" aria-labelledby="upload-heading">
            <div className="card-header">
              <div className="card-header__icon" aria-hidden="true">📤</div>
              <div>
                <h2 className="card-header__title" id="upload-heading">
                  Upload Your Files
                </h2>
                <p className="card-header__subtitle">
                  Upload a photo, signature, or both — JPG, PNG, WEBP accepted
                </p>
              </div>
            </div>
            <div className="upload-grid">
              <DropZone
                label="Passport Photo"
                icon="🧑‍💼"
                typeBadge="PHOTO"
                file={photoFile}
                preview={photoPreview}
                onFile={handlePhotoFile}
                onRemove={removePhoto}
              />
              <DropZone
                label="Signature"
                icon="✒️"
                typeBadge="SIGNATURE"
                file={sigFile}
                preview={sigPreview}
                onFile={handleSigFile}
                onRemove={removeSig}
              />
            </div>
          </section>

          {/* STEP 2: PRESET */}
          <section className="card" aria-labelledby="preset-heading">
            <div className="card-header">
              <div className="card-header__icon" aria-hidden="true">🏛️</div>
              <div>
                <h2 className="card-header__title" id="preset-heading">
                  Select Exam Portal
                </h2>
                <p className="card-header__subtitle">
                  Choose a preset to auto-load validated specifications
                </p>
              </div>
            </div>
            <PresetSelector
              selected={selectedPreset}
              onSelect={(id) => {
                setSelectedPreset(id);
                setCustomPhoto({});
                setCustomSig({});
              }}
            />
            <SpecPanel
              preset={preset}
              isCustom={isCustom}
              customPhoto={customPhoto}
              customSig={customSig}
              onCustomPhotoChange={(field, val) =>
                setCustomPhoto((prev) => ({ ...prev, [field]: val }))
              }
              onCustomSigChange={(field, val) =>
                setCustomSig((prev) => ({ ...prev, [field]: val }))
              }
            />
          </section>

          {/* GENERATE BUTTON */}
          {step !== "results" && (
            <button
              id="generate-btn"
              className="generate-btn"
              onClick={handleGenerate}
              disabled={!canGenerate}
              aria-label="Auto format images"
            >
              <span className="btn-icon" aria-hidden="true">⚡</span>
              {processing ? "Processing…" : "Auto Format Now"}
            </button>
          )}

          {/* STEP 3: RESULTS */}
          {step === "results" && Object.keys(results).length > 0 && (
            <section className="card" aria-labelledby="results-heading">
              <div className="results-header">
                <div className="card-header__icon" aria-hidden="true">✅</div>
                <div>
                  <h2
                    className="card-header__title"
                    id="results-heading"
                    style={{ color: "var(--success-600)" }}
                  >
                    Your Files Are Ready
                  </h2>
                  <p className="card-header__subtitle">
                    Processed for <strong>{preset.label}</strong> — download individually below
                  </p>
                </div>
              </div>

              <div className="results-grid">
                {results.photo && (
                  <ResultCard type="photo" result={results.photo} presetId={preset.id} />
                )}
                {results.signature && (
                  <ResultCard type="signature" result={results.signature} presetId={preset.id} />
                )}
              </div>

              <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
                <button
                  id="process-again-btn"
                  className="generate-btn"
                  onClick={handleGenerate}
                  style={{ flex: 1, minWidth: "200px", marginTop: "var(--space-6)" }}
                  aria-label="Process same files again with current settings"
                >
                  <span aria-hidden="true">🔄</span> Process Again
                </button>
                <button
                  id="start-over-btn"
                  className="reset-btn"
                  onClick={handleReset}
                  aria-label="Start over with new files"
                >
                  ✕ Start Over
                </button>
              </div>
            </section>
          )}

          {/* SESSION HISTORY */}
          <section className="card" aria-labelledby="history-heading">
            <div className="card-header">
              <div className="card-header__icon" aria-hidden="true">🕐</div>
              <div>
                <h2 className="card-header__title" id="history-heading">
                  Session History
                </h2>
                <p className="card-header__subtitle">
                  Last 5 processed files — cleared when you close the tab
                </p>
              </div>
            </div>
            <SessionHistory entries={history} />
          </section>
        </div>

        {/* ══ DOCUMENTS PANEL ══ */}
        <div
          id="panel-documents"
          role="tabpanel"
          aria-labelledby="tab-documents"
          hidden={mainTab !== "documents"}
        >
          <section className="card" aria-labelledby="doc-heading">
            <div className="card-header" style={{ marginBottom: "var(--space-2)" }}>
              <div className="card-header__icon" aria-hidden="true">📂</div>
              <div>
                <h2 className="card-header__title" id="doc-heading">
                  Document Formatter
                </h2>
                <p className="card-header__subtitle">
                  Compress &amp; format scanned documents to portal-accepted KB limits — up to 8 files at once
                </p>
              </div>
            </div>

            {/* Info callout */}
            <div style={{
              background: "var(--navy-50)",
              border: "1px solid var(--navy-200)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-4) var(--space-5)",
              marginBottom: "var(--space-6)",
              display: "flex",
              gap: "var(--space-3)",
              alignItems: "flex-start",
            }}>
              <span style={{ fontSize: "20px", flexShrink: 0 }}>💡</span>
              <div>
                <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--navy-800)", marginBottom: "var(--space-1)" }}>
                  How document formatting works
                </p>
                <p style={{ fontSize: "var(--font-size-sm)", color: "var(--gray-600)", lineHeight: 1.6 }}>
                  Upload a scanned image of your document (JPG/PNG/WEBP). The formatter will compress it to the required KB range while keeping text fully legible. Aspect ratio is preserved — no cropping. Supports batch processing of up to 8 documents.
                </p>
              </div>
            </div>

            <DocumentFormatter />
          </section>
        </div>

      </main>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section" aria-labelledby="how-heading">
        <h2 className="how-title" id="how-heading">How It Works</h2>
        <p className="how-subtitle">
          Four simple steps — no technical knowledge needed
        </p>
        <div className="how-grid">
          {[
            { num: "1", icon: "📤", title: "Upload", desc: "Drop your photo, signature, or document scan — any format works." },
            { num: "2", icon: "🏛️", title: "Select Type", desc: "Pick your exam portal or document type to auto-load specs." },
            { num: "3", icon: "⚡", title: "Auto Format", desc: "We resize, compress, crop, and validate to exact portal limits." },
            { num: "4", icon: "✅", title: "Download & Upload", desc: "Validated files download instantly — upload directly to the portal." },
          ].map((s) => (
            <div className="how-step" key={s.num}>
              <div className="how-step__num">{s.num}</div>
              <div className="how-step__icon">{s.icon}</div>
              <div className="how-step__title">{s.title}</div>
              <div className="how-step__desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="site-footer" role="contentinfo">
        <div className="footer-logo">Form<span>Ready</span></div>
        <p className="footer-note">
          All processing happens in your browser. No images are ever uploaded to
          our servers. Your files are 100% private.
        </p>
        <div className="footer-links">
          <a href="/admin" aria-label="Admin preset editor">Admin Panel</a>
          <span aria-hidden="true">·</span>
          <a href="#main-content" aria-label="Back to top">Back to top</a>
        </div>
        <p className="footer-copy">
          © 2026 FormReady · Built for CSC operators, coaching institutes &amp; exam aspirants
        </p>
      </footer>

      {/* ── PROCESSING OVERLAY ── */}
      {processing && (
        <div className="progress-overlay" role="dialog" aria-modal="true" aria-label="Processing images">
          <div className="progress-modal">
            <div className="progress-spinner" aria-hidden="true" />
            <h2 className="progress-title">Formatting Images</h2>
            <p className="progress-subtitle">{progressLabel}</p>
            <div className="progress-bar-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-pct">{progress}%</div>
          </div>
        </div>
      )}

      {/* ── TOASTS ── */}
      <ToastContainer />
    </>
  );
}
