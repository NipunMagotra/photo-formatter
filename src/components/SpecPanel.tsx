"use client";

import { ImageSpec, PortalPreset } from "@/lib/presets";

interface SpecPanelProps {
    preset: PortalPreset;
    customPhoto?: Partial<ImageSpec>;
    customSig?: Partial<ImageSpec>;
    isCustom?: boolean;
    onCustomPhotoChange?: (field: keyof ImageSpec, value: number) => void;
    onCustomSigChange?: (field: keyof ImageSpec, value: number) => void;
}

function SpecTable({
    spec,
    title,
}: {
    spec: ImageSpec;
    title: string;
}) {
    return (
        <div>
            <p className="spec-col__heading">{title}</p>
            <div className="spec-row">
                <span className="spec-row__key">Dimensions</span>
                <span className="spec-row__value">
                    {spec.width} × {spec.height} px
                </span>
            </div>
            <div className="spec-row">
                <span className="spec-row__key">File size</span>
                <span className="spec-row__value">
                    {spec.min_kb}–{spec.max_kb} KB
                </span>
            </div>
            <div className="spec-row">
                <span className="spec-row__key">Format</span>
                <span className="spec-row__value">JPG</span>
            </div>
            <div className="spec-row">
                <span className="spec-row__key">Background</span>
                <span className="spec-row__value" style={{ textTransform: "capitalize" }}>
                    {spec.background}
                </span>
            </div>
            {spec.notes && (
                <div className="spec-row">
                    <span className="spec-row__key" style={{ maxWidth: "60%" }}>
                        Note
                    </span>
                    <span
                        className="spec-row__value"
                        style={{ fontSize: "0.72rem", color: "var(--gray-500)", textAlign: "right" }}
                    >
                        {spec.notes}
                    </span>
                </div>
            )}
        </div>
    );
}

function CustomField({
    label,
    value,
    onChange,
    min,
    max,
}: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
}) {
    return (
        <div className="form-field">
            <label className="form-label">{label}</label>
            <input
                type="number"
                className="form-input"
                value={value}
                min={min ?? 1}
                max={max ?? 9999}
                onChange={(e) => onChange(Number(e.target.value))}
            />
        </div>
    );
}

export default function SpecPanel({
    preset,
    customPhoto,
    customSig,
    isCustom,
    onCustomPhotoChange,
    onCustomSigChange,
}: SpecPanelProps) {
    const photo = isCustom
        ? { ...preset.photo, ...customPhoto }
        : preset.photo;
    const sig = isCustom
        ? { ...preset.signature, ...customSig }
        : preset.signature;

    return (
        <div className="spec-panel">
            <p className="spec-panel__title">
                <span aria-hidden="true">📋</span> Specifications for {preset.label}
            </p>

            {isCustom ? (
                <div className="custom-inputs">
                    <div className="custom-group">
                        <p className="custom-group__title">📷 Photo</p>
                        <CustomField
                            label="Width (px)"
                            value={photo.width}
                            onChange={(v) => onCustomPhotoChange?.("width", v)}
                            min={10}
                            max={2000}
                        />
                        <CustomField
                            label="Height (px)"
                            value={photo.height}
                            onChange={(v) => onCustomPhotoChange?.("height", v)}
                            min={10}
                            max={2000}
                        />
                        <CustomField
                            label="Min size (KB)"
                            value={photo.min_kb}
                            onChange={(v) => onCustomPhotoChange?.("min_kb", v)}
                            min={1}
                            max={10000}
                        />
                        <CustomField
                            label="Max size (KB)"
                            value={photo.max_kb}
                            onChange={(v) => onCustomPhotoChange?.("max_kb", v)}
                            min={1}
                            max={10000}
                        />
                    </div>
                    <div className="custom-group">
                        <p className="custom-group__title">✒️ Signature</p>
                        <CustomField
                            label="Width (px)"
                            value={sig.width}
                            onChange={(v) => onCustomSigChange?.("width", v)}
                            min={10}
                            max={2000}
                        />
                        <CustomField
                            label="Height (px)"
                            value={sig.height}
                            onChange={(v) => onCustomSigChange?.("height", v)}
                            min={10}
                            max={2000}
                        />
                        <CustomField
                            label="Min size (KB)"
                            value={sig.min_kb}
                            onChange={(v) => onCustomSigChange?.("min_kb", v)}
                            min={1}
                            max={10000}
                        />
                        <CustomField
                            label="Max size (KB)"
                            value={sig.max_kb}
                            onChange={(v) => onCustomSigChange?.("max_kb", v)}
                            min={1}
                            max={10000}
                        />
                    </div>
                </div>
            ) : (
                <div className="spec-grid">
                    <SpecTable spec={preset.photo} title="📷 Photo Requirements" />
                    <SpecTable spec={preset.signature} title="✒️ Signature Requirements" />
                </div>
            )}
        </div>
    );
}
