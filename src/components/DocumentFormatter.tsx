"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
    DOCUMENT_PRESETS,
    DOCUMENT_PRESET_LIST,
    DocumentPreset,
} from "@/lib/presets";
import { processDocument, ProcessingResult, downloadDataUrl } from "@/lib/imageProcessor";
import { showToast } from "@/components/Toast";

interface DocEntry {
    id: number;
    file: File;
    preview: string;
    presetId: string;
    result?: ProcessingResult;
}

let docIdCounter = 0;

export default function DocumentFormatter() {
    const [selectedPreset, setSelectedPreset] = useState("marksheet");
    const [docs, setDocs] = useState<DocEntry[]>([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [customMin, setCustomMin] = useState(50);
    const [customMax, setCustomMax] = useState(500);
    const [dragging, setDragging] = useState(false);

    const preset: DocumentPreset = DOCUMENT_PRESETS[selectedPreset];
    const isCustom = selectedPreset === "custom_doc";

    const effectiveMin = isCustom ? customMin : preset.min_kb;
    const effectiveMax = isCustom ? customMax : preset.max_kb;

    const onDrop = useCallback((accepted: File[]) => {
        const newEntries: DocEntry[] = accepted.map((file) => ({
            id: ++docIdCounter,
            file,
            preview: URL.createObjectURL(file),
            presetId: selectedPreset,
        }));
        setDocs((prev) => [...prev, ...newEntries].slice(0, 8)); // max 8 docs at once
    }, [selectedPreset]);

    const { getRootProps, getInputProps, open } = useDropzone({
        onDrop,
        accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".bmp"] },
        maxSize: 10 * 1024 * 1024,
        multiple: true,
        noClick: false,
        onDragEnter: () => setDragging(true),
        onDragLeave: () => setDragging(false),
        onDropAccepted: () => setDragging(false),
        onDropRejected: () => setDragging(false),
    });

    const removeDoc = (id: number) => {
        setDocs((prev) => prev.filter((d) => d.id !== id));
    };

    const handleProcess = async () => {
        if (!docs.length || processing) return;
        setProcessing(true);
        setProgress(0);

        const updated = [...docs];
        for (let i = 0; i < updated.length; i++) {
            const doc = updated[i];
            try {
                const result = await processDocument(
                    doc.file,
                    preset,
                    effectiveMin,
                    effectiveMax,
                    (pct) => setProgress(Math.round(((i + pct / 100) / updated.length) * 100))
                );
                updated[i] = { ...doc, result };
                if (result.valid) showToast(`${doc.file.name} formatted ✓`, "success");
                else showToast(`${doc.file.name} — check validation`, "warning");
            } catch {
                showToast(`Failed to process ${doc.file.name}`, "error");
            }
        }

        setDocs(updated);
        setProcessing(false);
        setProgress(100);
    };

    const handleDownloadAll = () => {
        docs.forEach((doc) => {
            if (doc.result) {
                downloadDataUrl(
                    doc.result.dataUrl,
                    `${preset.id.toUpperCase()}_${doc.file.name.replace(/\.[^.]+$/, "")}.jpg`
                );
            }
        });
    };

    const allDone = docs.length > 0 && docs.every((d) => d.result);
    const allValid = allDone && docs.every((d) => d.result?.valid);

    return (
        <div>
            {/* ── Document Type Selector ── */}
            <div className="card-header" style={{ marginBottom: "var(--space-5)" }}>
                <div className="card-header__icon" aria-hidden="true">📂</div>
                <div>
                    <h2 className="card-header__title">Select Document Type</h2>
                    <p className="card-header__subtitle">
                        Pick the type that matches the document you are uploading
                    </p>
                </div>
            </div>

            <div className="preset-grid" style={{ marginBottom: "var(--space-6)" }} role="radiogroup" aria-label="Document type">
                {DOCUMENT_PRESET_LIST.map((p) => (
                    <button
                        key={p.id}
                        type="button"
                        role="radio"
                        aria-checked={selectedPreset === p.id}
                        id={`doc-preset-${p.id}`}
                        className={`preset-card${selectedPreset === p.id ? " selected" : ""}`}
                        onClick={() => setSelectedPreset(p.id)}
                    >
                        {selectedPreset === p.id && (
                            <span className="preset-selected-check" aria-hidden="true">✓</span>
                        )}
                        <span className="preset-card__icon" aria-hidden="true">{p.icon}</span>
                        <span className="preset-card__label">{p.label}</span>
                        <span className="preset-card__desc">{p.description}</span>
                    </button>
                ))}
            </div>

            {/* ── Spec Info Bar ── */}
            <div className="spec-panel" style={{ marginBottom: "var(--space-6)" }}>
                <p className="spec-panel__title">
                    <span aria-hidden="true">📋</span> {preset.label} — Requirements
                </p>

                {isCustom ? (
                    <div style={{ display: "flex", gap: "var(--space-5)", flexWrap: "wrap", alignItems: "flex-end" }}>
                        <div className="form-field" style={{ flex: 1, minWidth: "140px" }}>
                            <label className="form-label">Min size (KB)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={customMin}
                                min={1}
                                onChange={(e) => setCustomMin(Number(e.target.value))}
                                aria-label="Custom minimum KB"
                            />
                        </div>
                        <div className="form-field" style={{ flex: 1, minWidth: "140px" }}>
                            <label className="form-label">Max size (KB)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={customMax}
                                min={1}
                                onChange={(e) => setCustomMax(Number(e.target.value))}
                                aria-label="Custom maximum KB"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="spec-grid">
                        <div>
                            <div className="spec-row">
                                <span className="spec-row__key">Target size</span>
                                <span className="spec-row__value">{preset.min_kb}–{preset.max_kb} KB</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-row__key">Max width</span>
                                <span className="spec-row__value">{preset.maxWidth} px (auto height)</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-row__key">Format</span>
                                <span className="spec-row__value">JPG</span>
                            </div>
                        </div>
                        <div>
                            <div className="spec-row">
                                <span className="spec-row__key">Note</span>
                                <span className="spec-row__value" style={{ fontSize: "0.8rem", textAlign: "right" }}>{preset.notes}</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-row__key">Examples</span>
                                <span className="spec-row__value" style={{ fontSize: "0.78rem", color: "var(--gray-500)", textAlign: "right" }}>{preset.examples}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Drop Zone ── */}
            <div
                {...getRootProps()}
                className={`drop-zone${dragging ? " dragging" : ""}${docs.length ? " has-file" : ""}`}
                style={{ minHeight: "160px", marginBottom: "var(--space-6)" }}
                role="button"
                aria-label="Upload document images"
                tabIndex={0}
            >
                <input {...getInputProps()} id="doc-upload-input" />
                {docs.length === 0 ? (
                    <>
                        <span className="drop-zone__icon">📄</span>
                        <span className="drop-zone__type-badge">DOCUMENTS</span>
                        <span className="drop-zone__label">Drop document images here</span>
                        <span className="drop-zone__hint">
                            Drag & drop or{" "}
                            <span
                                className="drop-zone__browse"
                                onClick={(e) => { e.stopPropagation(); open(); }}
                            >
                                browse files
                            </span>
                        </span>
                        <span className="drop-zone__hint">JPG, PNG, WEBP · Max 10 MB each · Up to 8 files</span>
                    </>
                ) : (
                    <>
                        <span className="drop-zone__icon">✅</span>
                        <span className="drop-zone__type-badge">{docs.length} FILE{docs.length > 1 ? "S" : ""} ADDED</span>
                        <span className="drop-zone__hint">Drop more files to add, or manage below</span>
                    </>
                )}
            </div>

            {/* ── Uploaded Files List ── */}
            {docs.length > 0 && (
                <div style={{ marginBottom: "var(--space-6)" }}>
                    <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--navy-700)", marginBottom: "var(--space-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Uploaded Files ({docs.length})
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                        {docs.map((doc) => (
                            <div key={doc.id} className="history-item">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={doc.preview} alt={doc.file.name} className="history-thumb" />
                                <div className="history-info">
                                    <div className="history-info__name">{doc.file.name}</div>
                                    <div className="history-info__meta">
                                        {(doc.file.size / 1024).toFixed(1)} KB original
                                        {doc.result && (
                                            <span style={{ marginLeft: "var(--space-2)", color: doc.result.valid ? "var(--success-600)" : "var(--error-600)", fontWeight: 600 }}>
                                                → {doc.result.sizeKB} KB {doc.result.valid ? "✅ Ready" : "⚠ Check"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0 }}>
                                    {doc.result && (
                                        <button
                                            className="history-dl-btn"
                                            onClick={() => downloadDataUrl(
                                                doc.result!.dataUrl,
                                                `${preset.id.toUpperCase()}_${doc.file.name.replace(/\.[^.]+$/, "")}.jpg`
                                            )}
                                            aria-label={`Download ${doc.file.name}`}
                                        >
                                            ⬇ Save
                                        </button>
                                    )}
                                    <button
                                        className="history-dl-btn"
                                        style={{ background: "var(--error-500)" }}
                                        onClick={() => removeDoc(doc.id)}
                                        aria-label={`Remove ${doc.file.name}`}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Process Button ── */}
            {docs.length > 0 && (
                <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
                    <button
                        id="process-docs-btn"
                        className="generate-btn"
                        style={{ flex: 1 }}
                        onClick={handleProcess}
                        disabled={processing}
                        aria-label="Process all document images"
                    >
                        {processing ? (
                            <>
                                <span style={{ display: "inline-block", width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} aria-hidden="true" />
                                Processing… {progress}%
                            </>
                        ) : (
                            <><span aria-hidden="true">⚡</span> Format {docs.length} Document{docs.length > 1 ? "s" : ""}</>
                        )}
                    </button>

                    {allDone && (
                        <button
                            id="download-all-docs-btn"
                            className="download-btn"
                            style={{ padding: "var(--space-4) var(--space-6)", borderRadius: "var(--radius-lg)", fontSize: "var(--font-size-base)" }}
                            onClick={handleDownloadAll}
                            aria-label="Download all formatted documents"
                        >
                            ⬇ Download All
                        </button>
                    )}

                    <button
                        className="reset-btn"
                        onClick={() => { setDocs([]); setProgress(0); }}
                        aria-label="Clear all documents"
                    >
                        ✕ Clear All
                    </button>
                </div>
            )}

            {/* Summary badge */}
            {allDone && (
                <div
                    className={`result-validation ${allValid ? "valid" : "invalid"}`}
                    style={{ marginTop: "var(--space-5)" }}
                    role="status"
                >
                    {allValid
                        ? `✅ All ${docs.length} document${docs.length > 1 ? "s" : ""} formatted and ready for portal upload`
                        : `⚠ Some documents didn't hit the exact KB range — review individual files above`}
                </div>
            )}
        </div>
    );
}
