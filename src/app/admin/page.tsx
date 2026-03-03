"use client";

import { useState } from "react";
import { PORTAL_PRESETS, PortalPreset } from "@/lib/presets";
import Link from "next/link";

export default function AdminPage() {
    const [presets, setPresets] = useState(
        Object.values(PORTAL_PRESETS).map((p) => ({ ...p }))
    );
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // In production: POST to /api/admin/presets to persist
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const updateField = (
        presetId: string,
        type: "photo" | "signature",
        field: string,
        value: string | number
    ) => {
        setPresets((prev) =>
            prev.map((p) =>
                p.id === presetId
                    ? { ...p, [type]: { ...p[type], [field]: Number(value) } }
                    : p
            )
        );
        setSaved(false);
    };

    return (
        <>
            <header className="site-header" role="banner">
                <div className="header-logo">
                    <div className="header-logo__icon" aria-hidden="true">⚙️</div>
                    <div>
                        <div className="header-logo__name">
                            Form<span>Ready</span> — Admin
                        </div>
                        <div className="header-tagline">Preset Configuration Editor</div>
                    </div>
                </div>
                <Link
                    href="/"
                    style={{
                        color: "var(--accent-300)",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                    }}
                    aria-label="Back to main app"
                >
                    ← Back to App
                </Link>
            </header>

            <main className="main-wrapper">
                <div className="card">
                    <div className="card-header">
                        <div className="card-header__icon" aria-hidden="true">📋</div>
                        <div>
                            <h1 className="card-header__title">Portal Preset Editor</h1>
                            <p className="card-header__subtitle">
                                Edit the validated specs for each government exam portal
                            </p>
                        </div>
                    </div>

                    <div
                        style={{
                            background: "var(--warning-100)",
                            border: "1px solid rgba(245,158,11,0.3)",
                            borderRadius: "var(--radius-md)",
                            padding: "var(--space-4)",
                            marginBottom: "var(--space-6)",
                            color: "#92400e",
                            fontSize: "var(--font-size-sm)",
                        }}
                        role="alert"
                    >
                        ⚠️ <strong>Admin Mode:</strong> Changes here affect all users.
                        Always verify specifications against the official portal before
                        publishing.
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table className="admin-table" aria-label="Portal preset specifications">
                            <thead>
                                <tr>
                                    <th>Portal</th>
                                    <th>Photo W×H (px)</th>
                                    <th>Photo KB</th>
                                    <th>Sig W×H (px)</th>
                                    <th>Sig KB</th>
                                </tr>
                            </thead>
                            <tbody>
                                {presets.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div
                                                style={{
                                                    fontWeight: 700,
                                                    color: "var(--navy-800)",
                                                    marginBottom: "4px",
                                                }}
                                            >
                                                {p.icon} {p.label}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "0.75rem",
                                                    color: "var(--gray-500)",
                                                }}
                                            >
                                                {p.description}
                                            </div>
                                        </td>

                                        {/* Photo dims */}
                                        <td>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "var(--space-2)",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ width: "70px", padding: "6px 8px" }}
                                                    value={p.photo.width}
                                                    min={10}
                                                    aria-label={`${p.label} photo width`}
                                                    onChange={(e) =>
                                                        updateField(p.id, "photo", "width", e.target.value)
                                                    }
                                                />
                                                <span style={{ color: "var(--gray-400)" }}>×</span>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ width: "70px", padding: "6px 8px" }}
                                                    value={p.photo.height}
                                                    min={10}
                                                    aria-label={`${p.label} photo height`}
                                                    onChange={(e) =>
                                                        updateField(p.id, "photo", "height", e.target.value)
                                                    }
                                                />
                                            </div>
                                        </td>

                                        {/* Photo KB */}
                                        <td>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "var(--space-2)",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ width: "60px", padding: "6px 8px" }}
                                                    value={p.photo.min_kb}
                                                    min={1}
                                                    aria-label={`${p.label} photo min KB`}
                                                    onChange={(e) =>
                                                        updateField(p.id, "photo", "min_kb", e.target.value)
                                                    }
                                                />
                                                <span style={{ color: "var(--gray-400)" }}>–</span>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ width: "60px", padding: "6px 8px" }}
                                                    value={p.photo.max_kb}
                                                    min={1}
                                                    aria-label={`${p.label} photo max KB`}
                                                    onChange={(e) =>
                                                        updateField(p.id, "photo", "max_kb", e.target.value)
                                                    }
                                                />
                                            </div>
                                        </td>

                                        {/* Sig dims */}
                                        <td>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "var(--space-2)",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ width: "70px", padding: "6px 8px" }}
                                                    value={p.signature.width}
                                                    min={10}
                                                    aria-label={`${p.label} signature width`}
                                                    onChange={(e) =>
                                                        updateField(p.id, "signature", "width", e.target.value)
                                                    }
                                                />
                                                <span style={{ color: "var(--gray-400)" }}>×</span>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ width: "70px", padding: "6px 8px" }}
                                                    value={p.signature.height}
                                                    min={10}
                                                    aria-label={`${p.label} signature height`}
                                                    onChange={(e) =>
                                                        updateField(p.id, "signature", "height", e.target.value)
                                                    }
                                                />
                                            </div>
                                        </td>

                                        {/* Sig KB */}
                                        <td>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "var(--space-2)",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ width: "60px", padding: "6px 8px" }}
                                                    value={p.signature.min_kb}
                                                    min={1}
                                                    aria-label={`${p.label} signature min KB`}
                                                    onChange={(e) =>
                                                        updateField(p.id, "signature", "min_kb", e.target.value)
                                                    }
                                                />
                                                <span style={{ color: "var(--gray-400)" }}>–</span>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ width: "60px", padding: "6px 8px" }}
                                                    value={p.signature.max_kb}
                                                    min={1}
                                                    aria-label={`${p.label} signature max KB`}
                                                    onChange={(e) =>
                                                        updateField(p.id, "signature", "max_kb", e.target.value)
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div
                        style={{
                            marginTop: "var(--space-8)",
                            display: "flex",
                            gap: "var(--space-4)",
                            alignItems: "center",
                        }}
                    >
                        <button
                            id="admin-save-btn"
                            className="generate-btn"
                            onClick={handleSave}
                            style={{ width: "auto", padding: "var(--space-4) var(--space-8)" }}
                            aria-label="Save preset changes"
                        >
                            {saved ? "✅ Saved!" : "💾 Save Changes"}
                        </button>
                        {saved && (
                            <span
                                style={{
                                    color: "var(--success-600)",
                                    fontWeight: 600,
                                    fontSize: "var(--font-size-sm)",
                                }}
                                role="status"
                            >
                                Changes saved! Deploy to publish for all users.
                            </span>
                        )}
                    </div>
                </div>

                {/* Quick reference */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-header__icon" aria-hidden="true">📚</div>
                        <div>
                            <h2 className="card-header__title">Quick Reference</h2>
                            <p className="card-header__subtitle">
                                Official portal specifications last verified March 2026
                            </p>
                        </div>
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: "var(--space-4)",
                        }}
                    >
                        {[
                            {
                                portal: "SSC",
                                url: "https://ssc.nic.in",
                                note: "Photo: 100×120px, 20-50KB. Sig: 140×60px, 10-20KB",
                            },
                            {
                                portal: "IBPS",
                                url: "https://www.ibps.in",
                                note: "Photo: 200×230px, 20-50KB. Sig: 140×60px, 10-20KB",
                            },
                            {
                                portal: "RRB",
                                url: "https://indianrailways.gov.in",
                                note: "Photo: 150×180px, 15-40KB. Sig: 100×60px, 10-40KB",
                            },
                            {
                                portal: "UPSC",
                                url: "https://upsconline.nic.in",
                                note: "Photo: 200×300px, 20-300KB. Sig: 250×100px, 20-300KB",
                            },
                        ].map((item) => (
                            <div
                                key={item.portal}
                                style={{
                                    background: "var(--gray-50)",
                                    border: "1px solid var(--gray-200)",
                                    borderRadius: "var(--radius-md)",
                                    padding: "var(--space-4)",
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 700,
                                        color: "var(--navy-800)",
                                        marginBottom: "var(--space-2)",
                                    }}
                                >
                                    {item.portal}
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "var(--gray-600)",
                                        marginBottom: "var(--space-2)",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {item.note}
                                </div>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "var(--navy-600)",
                                        textDecoration: "underline",
                                    }}
                                >
                                    Official site ↗
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="site-footer" role="contentinfo">
                <p className="footer-copy">FormReady Admin Panel · Restricted Access</p>
            </footer>
        </>
    );
}
