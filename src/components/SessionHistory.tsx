"use client";

import { ProcessingResult } from "@/lib/imageProcessor";
import { downloadDataUrl } from "@/lib/imageProcessor";

export interface HistoryEntry {
    id: number;
    label: string;
    type: "photo" | "signature";
    presetId: string;
    result: ProcessingResult;
    timestamp: Date;
}

interface SessionHistoryProps {
    entries: HistoryEntry[];
}

export default function SessionHistory({ entries }: SessionHistoryProps) {
    if (entries.length === 0) {
        return (
            <p
                style={{
                    textAlign: "center",
                    color: "var(--gray-400)",
                    fontSize: "var(--font-size-sm)",
                    padding: "var(--space-8) 0",
                }}
            >
                No files generated yet in this session.
            </p>
        );
    }

    return (
        <div className="history-list">
            {[...entries].reverse().map((entry) => (
                <div key={entry.id} className="history-item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={entry.result.dataUrl}
                        alt={entry.label}
                        className="history-thumb"
                    />
                    <div className="history-info">
                        <div className="history-info__name">{entry.label}</div>
                        <div className="history-info__meta">
                            {entry.presetId.toUpperCase()} · {entry.result.width}×
                            {entry.result.height}px · {entry.result.sizeKB} KB ·{" "}
                            {entry.result.valid ? "✅ Valid" : "⚠ Check"}
                        </div>
                    </div>
                    <button
                        className="history-dl-btn"
                        onClick={() =>
                            downloadDataUrl(
                                entry.result.dataUrl,
                                `${entry.presetId.toUpperCase()}_${entry.type}_${entry.result.width}x${entry.result.height}.jpg`
                            )
                        }
                        aria-label={`Re-download ${entry.label}`}
                    >
                        ⬇ Save
                    </button>
                </div>
            ))}
        </div>
    );
}
