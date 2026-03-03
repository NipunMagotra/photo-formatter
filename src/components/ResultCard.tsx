"use client";

import { ProcessingResult } from "@/lib/imageProcessor";
import { downloadDataUrl } from "@/lib/imageProcessor";

interface ResultCardProps {
    type: "photo" | "signature";
    result: ProcessingResult;
    presetId: string;
}

export default function ResultCard({ type, result, presetId }: ResultCardProps) {
    const label = type === "photo" ? "Photo" : "Signature";
    const icon = type === "photo" ? "📷" : "✒️";
    const filename = `${presetId.toUpperCase()}_${label}_${result.width}x${result.height}.jpg`;

    const handleDownload = () => {
        downloadDataUrl(result.dataUrl, filename);
    };

    return (
        <div className={`result-card ${result.valid ? "valid" : "invalid"}`}>
            <div className="result-card__header">
                <span className="result-card__title">
                    {icon} {label}
                </span>
                <span
                    className={`results-badge ${result.valid ? "success" : "warning"}`}
                >
                    {result.valid ? "✓ Portal Ready" : "⚠ Check Required"}
                </span>
            </div>

            <div className="result-card__body">
                <div className="result-preview-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={result.dataUrl}
                        alt={`Processed ${label}`}
                        className="result-preview"
                    />
                </div>

                <div className="result-meta">
                    <div className="result-meta-row">
                        <span className="result-meta-row__key">Dimensions</span>
                        <span className="result-meta-row__val">
                            {result.width} × {result.height} px
                        </span>
                    </div>
                    <div className="result-meta-row">
                        <span className="result-meta-row__key">File size</span>
                        <span className="result-meta-row__val">{result.sizeKB} KB</span>
                    </div>
                    <div className="result-meta-row">
                        <span className="result-meta-row__key">Format</span>
                        <span className="result-meta-row__val">JPEG</span>
                    </div>
                    <div className="result-meta-row">
                        <span className="result-meta-row__key">Background</span>
                        <span className="result-meta-row__val">White</span>
                    </div>
                </div>

                <div
                    className={`result-validation ${result.valid ? "valid" : "invalid"}`}
                >
                    {result.valid ? (
                        <>✅ Ready for portal upload</>
                    ) : (
                        <div>
                            <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                                ⚠ Validation Issues
                            </div>
                            {result.validationErrors.map((e, i) => (
                                <div key={i} style={{ fontSize: "0.8rem", fontWeight: 400 }}>
                                    • {e}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    id={`download-${type}`}
                    className="download-btn"
                    onClick={handleDownload}
                    aria-label={`Download formatted ${label}`}
                >
                    ⬇ Download {label}
                    <span style={{ opacity: 0.7, fontSize: "0.75rem" }}>
                        &nbsp;({filename})
                    </span>
                </button>
            </div>
        </div>
    );
}
