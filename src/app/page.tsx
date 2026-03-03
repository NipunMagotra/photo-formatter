"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PORTAL_PRESETS, DOCUMENT_PRESETS, DOCUMENT_PRESET_LIST } from "@/lib/presets";
import { processImage, processDocument, downloadDataUrl, ProcessingResult } from "@/lib/imageProcessor";
import { ImageSpec } from "@/lib/presets";

/* ── tiny toast ── */
let toastId = 0;
type Toast = { id: number; msg: string; ok: boolean };

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = (msg: string, ok = true) => {
    const id = ++toastId;
    setToasts(p => [...p, { id, msg, ok }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  return { toasts, add };
}

/* ── simple dropzone ── */
function DZ({ label, badge, onFile, file, preview, onRemove }: {
  label: string; badge: string;
  onFile: (f: File) => void; file: File | null;
  preview: string | null; onRemove: () => void;
}) {
  const [drag, setDrag] = useState(false);
  const { getRootProps, getInputProps, open } = useDropzone({
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    noClick: !!file,
    onDrop: (a) => { if (a[0]) onFile(a[0]); },
    onDragEnter: () => setDrag(true),
    onDragLeave: () => setDrag(false),
    onDropAccepted: () => setDrag(false),
    onDropRejected: () => setDrag(false),
  });

  return (
    <div
      {...getRootProps()}
      className={`dz${drag ? " drag" : ""}${file ? " filled" : ""}`}
      role="button"
      aria-label={`Upload ${label}`}
      tabIndex={0}
    >
      <input {...getInputProps()} id={`input-${badge}`} />
      {file && (
        <button className="dz-remove" type="button" onClick={e => { e.stopPropagation(); onRemove(); }} aria-label="Remove">✕</button>
      )}
      {preview
        ? <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="dz-preview" />
          <span className="dz-badge" style={{ color: "var(--success)" }}>✓ {badge}</span>
          <span className="dz-hint">{file?.name}</span>
        </>
        : <>
          <span className="dz-icon">{badge === "PHOTO" ? "📷" : "✒️"}</span>
          <span className="dz-label">{label}</span>
          <span className="dz-hint">
            Drop here or{" "}
            <span className="dz-link" onClick={e => { e.stopPropagation(); open(); }}>browse</span>
          </span>
          <span className="dz-hint" style={{ fontSize: "11px" }}>JPG · PNG · max 5 MB</span>
        </>
      }
    </div>
  );
}

/* ── result box ── */
function ResultBox({ label, result, filename }: {
  label: string; result: ProcessingResult; filename: string;
}) {
  const ok = result.valid;
  return (
    <div className={`result-box ${ok ? "ok" : "warn"}`}>
      <div className="result-img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={result.dataUrl} alt={label} className="result-img" />
      </div>
      <div className="result-body">
        <div className="result-name">{label}</div>
        <div className="result-meta">
          {result.width}×{result.height}px · {result.sizeKB} KB · JPG
        </div>
        <div className={`result-status ${ok ? "ok" : "warn"}`}>
          {ok ? "✅ Ready to upload" : "⚠ Check size"}
        </div>
        <button className="dl-btn" onClick={() => downloadDataUrl(result.dataUrl, filename)}>
          ↓ Download
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function Page() {
  const { toasts, add } = useToasts();

  /* tab */
  const [tab, setTab] = useState<"ps" | "doc">("ps");

  /* photo & sig */
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [sigPreview, setSigPreview] = useState<string | null>(null);

  /* portal preset */
  const [portalId, setPortalId] = useState("ssc");
  const preset = PORTAL_PRESETS[portalId];
  const isCustom = portalId === "custom";
  const [customPhotoMin, setCustomPhotoMin] = useState(20);
  const [customPhotoMax, setCustomPhotoMax] = useState(50);
  const [customSigMin, setCustomSigMin] = useState(10);
  const [customSigMax, setCustomSigMax] = useState(20);
  const [customPhotoW, setCustomPhotoW] = useState(200);
  const [customPhotoH, setCustomPhotoH] = useState(230);
  const [customSigW, setCustomSigW] = useState(140);
  const [customSigH, setCustomSigH] = useState(60);

  const effectivePhoto: ImageSpec = isCustom
    ? { ...preset.photo, width: customPhotoW, height: customPhotoH, min_kb: customPhotoMin, max_kb: customPhotoMax }
    : preset.photo;
  const effectiveSig: ImageSpec = isCustom
    ? { ...preset.signature, width: customSigW, height: customSigH, min_kb: customSigMin, max_kb: customSigMax }
    : preset.signature;

  /* results */
  const [photoResult, setPhotoResult] = useState<ProcessingResult | null>(null);
  const [sigResult, setSigResult] = useState<ProcessingResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [done, setDone] = useState(false);

  /* doc mode */
  const [docPresetId, setDocPresetId] = useState("marksheet");
  const [docMin, setDocMin] = useState(100);
  const [docMax, setDocMax] = useState(500);
  const [docFiles, setDocFiles] = useState<{ id: number; file: File; preview: string; result?: ProcessingResult }[]>([]);
  let docCounter = 0;
  const [docDrag, setDocDrag] = useState(false);

  const docPreset = DOCUMENT_PRESETS[docPresetId];
  const isDocCustom = docPresetId === "custom_doc";
  const effectiveDocMin = isDocCustom ? docMin : docPreset.min_kb;
  const effectiveDocMax = isDocCustom ? docMax : docPreset.max_kb;

  const { getRootProps: getDocRootProps, getInputProps: getDocInputProps, open: openDoc } = useDropzone({
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    onDrop: (accepted) => {
      const newEntries = accepted.map(f => ({
        id: ++docCounter,
        file: f,
        preview: URL.createObjectURL(f),
      }));
      setDocFiles(prev => [...prev, ...newEntries].slice(0, 8));
    },
    onDragEnter: () => setDocDrag(true),
    onDragLeave: () => setDocDrag(false),
    onDropAccepted: () => setDocDrag(false),
    onDropRejected: () => setDocDrag(false),
  });

  /* handlers */
  const handlePhotoFile = useCallback((f: File) => {
    setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f));
    setPhotoResult(null); setDone(false);
  }, []);
  const handleSigFile = useCallback((f: File) => {
    setSigFile(f); setSigPreview(URL.createObjectURL(f));
    setSigResult(null); setDone(false);
  }, []);
  const resetPhoto = () => { setPhotoFile(null); setPhotoPreview(null); setPhotoResult(null); setDone(false); };
  const resetSig = () => { setSigFile(null); setSigPreview(null); setSigResult(null); setDone(false); };

  const handleFormat = async () => {
    if ((!photoFile && !sigFile) || busy) return;
    setBusy(true); setProgress(0); setPhotoResult(null); setSigResult(null); setDone(false);
    try {
      if (photoFile) {
        setProgressLabel("Formatting photo…");
        const r = await processImage(photoFile, effectivePhoto, p => setProgress(Math.round(p * (sigFile ? 0.5 : 1))));
        setPhotoResult(r);
        add(r.valid ? "Photo ready ✓" : "Photo processed — check size", r.valid);
      }
      if (sigFile) {
        setProgressLabel("Formatting signature…");
        const start = photoFile ? 50 : 0;
        const r = await processImage(sigFile, effectiveSig, p => setProgress(start + Math.round(p * (photoFile ? 0.5 : 1))));
        setSigResult(r);
        add(r.valid ? "Signature ready ✓" : "Signature processed — check size", r.valid);
      }
      setDone(true);
    } catch {
      add("Something went wrong. Try again.", false);
    } finally {
      setBusy(false); setProgress(100);
    }
  };

  const handleDocFormat = async () => {
    if (!docFiles.length || busy) return;
    setBusy(true); setProgress(0);
    const updated = [...docFiles];
    for (let i = 0; i < updated.length; i++) {
      setProgressLabel(`Formatting document ${i + 1} of ${updated.length}…`);
      try {
        const r = await processDocument(
          updated[i].file, docPreset,
          effectiveDocMin, effectiveDocMax,
          p => setProgress(Math.round(((i + p / 100) / updated.length) * 100))
        );
        updated[i] = { ...updated[i], result: r };
        add(`${updated[i].file.name} done`, r.valid);
      } catch {
        add(`Failed: ${updated[i].file.name}`, false);
      }
    }
    setDocFiles(updated);
    setBusy(false); setProgress(100);
  };

  const canFormat = (photoFile || sigFile) && !busy;
  const canDocFormat = docFiles.length > 0 && !busy;

  return (
    <>
      {/* ── TOP BAR ── */}
      <header className="top-bar">
        <span className="logo">Form<span>Ready</span></span>
        <a href="/admin" className="admin-link">Admin ↗</a>
      </header>

      <div className="page-wrap">

        {/* ── TABS ── */}
        <div className="tab-row" role="tablist">
          <button
            id="tab-ps"
            className={`tab-btn${tab === "ps" ? " active" : ""}`}
            role="tab" aria-selected={tab === "ps"}
            onClick={() => setTab("ps")}
          >
            📷 Photo & Signature
          </button>
          <button
            id="tab-doc"
            className={`tab-btn${tab === "doc" ? " active" : ""}`}
            role="tab" aria-selected={tab === "doc"}
            onClick={() => setTab("doc")}
          >
            📄 Documents
          </button>
        </div>

        {/* ══════ PHOTO & SIGNATURE ══════ */}
        <div hidden={tab !== "ps"} role="tabpanel" aria-labelledby="tab-ps">

          {/* Step 1 — Upload */}
          <div className="step">
            <div className="step-label">
              <div className={`step-num${photoFile || sigFile ? " done" : ""}`}>
                {(photoFile || sigFile) ? "✓" : "1"}
              </div>
              <span className="step-title">Upload your files</span>
            </div>
            <div className="upload-row">
              <DZ
                label="Passport Photo" badge="PHOTO"
                file={photoFile} preview={photoPreview}
                onFile={handlePhotoFile} onRemove={resetPhoto}
              />
              <DZ
                label="Signature" badge="SIGNATURE"
                file={sigFile} preview={sigPreview}
                onFile={handleSigFile} onRemove={resetSig}
              />
            </div>
          </div>

          {/* Step 2 — Portal */}
          <div className="step">
            <div className="step-label">
              <div className="step-num" style={{ background: "var(--navy)" }}>2</div>
              <span className="step-title">Select exam portal</span>
            </div>

            <select
              id="portal-select"
              className="portal-select"
              value={portalId}
              onChange={e => setPortalId(e.target.value)}
              aria-label="Select exam portal"
            >
              {Object.values(PORTAL_PRESETS).map(p => (
                <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
              ))}
            </select>

            {!isCustom ? (
              <div className="spec-bar">
                <span className="spec-pill">📷 Photo: <strong>{preset.photo.width}×{preset.photo.height}px</strong></span>
                <span className="spec-pill"><strong>{preset.photo.min_kb}–{preset.photo.max_kb} KB</strong></span>
                <span className="spec-pill">✒️ Sig: <strong>{preset.signature.width}×{preset.signature.height}px</strong></span>
                <span className="spec-pill"><strong>{preset.signature.min_kb}–{preset.signature.max_kb} KB</strong></span>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", marginTop: "14px", marginBottom: "8px" }}>PHOTO SETTINGS</p>
                <div className="custom-row">
                  <div>
                    <label className="field-label">Width (px)</label>
                    <input className="field-input" type="number" value={customPhotoW} min={10} onChange={e => setCustomPhotoW(+e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Height (px)</label>
                    <input className="field-input" type="number" value={customPhotoH} min={10} onChange={e => setCustomPhotoH(+e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Min KB</label>
                    <input className="field-input" type="number" value={customPhotoMin} min={1} onChange={e => setCustomPhotoMin(+e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Max KB</label>
                    <input className="field-input" type="number" value={customPhotoMax} min={1} onChange={e => setCustomPhotoMax(+e.target.value)} />
                  </div>
                </div>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", marginTop: "14px", marginBottom: "8px" }}>SIGNATURE SETTINGS</p>
                <div className="custom-row">
                  <div>
                    <label className="field-label">Width (px)</label>
                    <input className="field-input" type="number" value={customSigW} min={10} onChange={e => setCustomSigW(+e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Height (px)</label>
                    <input className="field-input" type="number" value={customSigH} min={10} onChange={e => setCustomSigH(+e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Min KB</label>
                    <input className="field-input" type="number" value={customSigMin} min={1} onChange={e => setCustomSigMin(+e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Max KB</label>
                    <input className="field-input" type="number" value={customSigMax} min={1} onChange={e => setCustomSigMax(+e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 3 — Format & Download */}
          <div className="step">
            <div className="step-label">
              <div className={`step-num${done ? " done" : ""}`}>{done ? "✓" : "3"}</div>
              <span className="step-title">Format &amp; download</span>
            </div>

            <button
              id="format-btn"
              className="cta-btn"
              onClick={handleFormat}
              disabled={!canFormat}
              aria-label="Format images"
            >
              {busy ? "Formatting…" : "⚡ Format Now"}
            </button>

            {(photoResult || sigResult) && (
              <>
                <div className="result-row">
                  {photoResult && (
                    <ResultBox
                      label="Photo"
                      result={photoResult}
                      filename={`${portalId.toUpperCase()}_Photo_${photoResult.width}x${photoResult.height}.jpg`}
                    />
                  )}
                  {sigResult && (
                    <ResultBox
                      label="Signature"
                      result={sigResult}
                      filename={`${portalId.toUpperCase()}_Signature_${sigResult.width}x${sigResult.height}.jpg`}
                    />
                  )}
                </div>
                <span className="reset-link" onClick={() => { resetPhoto(); resetSig(); setDone(false); }}>
                  Start over
                </span>
              </>
            )}
          </div>
        </div>

        {/* ══════ DOCUMENTS ══════ */}
        <div hidden={tab !== "doc"} role="tabpanel" aria-labelledby="tab-doc">

          {/* Step 1 — Document type */}
          <div className="step">
            <div className="step-label">
              <div className="step-num">1</div>
              <span className="step-title">Select document type</span>
            </div>
            <select
              id="doc-type-select"
              className="portal-select"
              value={docPresetId}
              onChange={e => setDocPresetId(e.target.value)}
              aria-label="Select document type"
            >
              {DOCUMENT_PRESET_LIST.map(p => (
                <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
              ))}
            </select>

            {!isDocCustom ? (
              <div className="spec-bar">
                <span className="spec-pill">Target: <strong>{docPreset.min_kb}–{docPreset.max_kb} KB</strong></span>
                <span className="spec-pill">Max width: <strong>{docPreset.maxWidth}px</strong></span>
                <span className="spec-pill" style={{ color: "var(--muted)" }}>{docPreset.notes}</span>
              </div>
            ) : (
              <div className="custom-row" style={{ marginTop: "12px" }}>
                <div>
                  <label className="field-label">Min KB</label>
                  <input className="field-input" type="number" value={docMin} min={1} onChange={e => setDocMin(+e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Max KB</label>
                  <input className="field-input" type="number" value={docMax} min={1} onChange={e => setDocMax(+e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Step 2 — Upload documents */}
          <div className="step">
            <div className="step-label">
              <div className={`step-num${docFiles.length ? " done" : ""}`}>{docFiles.length ? "✓" : "2"}</div>
              <span className="step-title">Upload documents <span style={{ fontWeight: 400, color: "var(--muted)" }}>({docFiles.length}/8)</span></span>
            </div>

            <div
              {...getDocRootProps()}
              className={`dz${docDrag ? " drag" : ""}`}
              style={{ minHeight: "90px", marginBottom: "12px" }}
              role="button"
              aria-label="Upload document images"
              tabIndex={0}
            >
              <input {...getDocInputProps()} id="doc-input" />
              <span className="dz-icon">📄</span>
              <span className="dz-hint">
                Drop images here or{" "}
                <span className="dz-link" onClick={e => { e.stopPropagation(); openDoc(); }}>browse</span>
              </span>
              <span className="dz-hint" style={{ fontSize: "11px" }}>JPG · PNG · WEBP · up to 8 files · max 10 MB each</span>
            </div>

            {docFiles.map(d => (
              <div key={d.id} className="doc-file-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.preview} alt={d.file.name} className="doc-thumb" />
                <div className="doc-info">
                  <div className="doc-name">{d.file.name}</div>
                  <div className="doc-sub">
                    {(d.file.size / 1024).toFixed(1)} KB original
                    {d.result && (
                      <span style={{ marginLeft: "6px", color: d.result.valid ? "var(--success)" : "var(--warn)", fontWeight: 600 }}>
                        → {d.result.sizeKB} KB {d.result.valid ? "✓" : "⚠"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="doc-actions">
                  {d.result && (
                    <button
                      className="sm-btn navy"
                      onClick={() => downloadDataUrl(d.result!.dataUrl, `${docPresetId}_${d.file.name.replace(/\.[^.]+$/, "")}.jpg`)}
                      aria-label="Download"
                    >↓</button>
                  )}
                  <button
                    className="sm-btn red"
                    onClick={() => setDocFiles(p => p.filter(x => x.id !== d.id))}
                    aria-label="Remove"
                  >✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Step 3 — Format */}
          <div className="step">
            <div className="step-label">
              <div className="step-num">3</div>
              <span className="step-title">Format &amp; download</span>
            </div>

            <button
              id="format-docs-btn"
              className="cta-btn"
              onClick={handleDocFormat}
              disabled={!canDocFormat}
              aria-label="Format documents"
            >
              {busy ? "Formatting…" : `⚡ Format ${docFiles.length || ""} Document${docFiles.length !== 1 ? "s" : ""}`}
            </button>

            {docFiles.some(d => d.result) && (
              <>
                <button
                  id="download-all-btn"
                  className="dl-btn"
                  style={{ width: "100%", marginBottom: "10px" }}
                  onClick={() => docFiles.forEach(d => d.result && downloadDataUrl(
                    d.result.dataUrl,
                    `${docPresetId}_${d.file.name.replace(/\.[^.]+$/, "")}.jpg`
                  ))}
                  aria-label="Download all formatted documents"
                >
                  ↓ Download All
                </button>
                <span className="reset-link" onClick={() => setDocFiles([])}>Clear all</span>
              </>
            )}
          </div>
        </div>

        {/* Privacy note */}
        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--muted)", marginTop: "24px" }}>
          🔒 All processing happens in your browser. Nothing is uploaded to any server.
        </p>
      </div>

      {/* ── PROCESSING OVERLAY ── */}
      {busy && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Processing">
          <div className="overlay-box">
            <div className="spin" aria-hidden="true" />
            <div className="ovl-title">Formatting…</div>
            <div className="ovl-sub">{progressLabel}</div>
            <div className="bar-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="bar-pct">{progress}%</div>
          </div>
        </div>
      )}

      {/* ── TOASTS ── */}
      <div className="toast-wrap" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            {t.ok ? "✅" : "⚠️"} {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}
