"use client";

import { PRESET_LIST } from "@/lib/presets";

interface PresetSelectorProps {
    selected: string;
    onSelect: (id: string) => void;
}

export default function PresetSelector({
    selected,
    onSelect,
}: PresetSelectorProps) {
    return (
        <div className="preset-grid" role="radiogroup" aria-label="Portal preset">
            {PRESET_LIST.map((p) => (
                <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={selected === p.id}
                    id={`preset-${p.id}`}
                    className={`preset-card${selected === p.id ? " selected" : ""}`}
                    onClick={() => onSelect(p.id)}
                >
                    {selected === p.id && (
                        <span className="preset-selected-check" aria-hidden="true">
                            ✓
                        </span>
                    )}
                    <span className="preset-card__icon" aria-hidden="true">
                        {p.icon}
                    </span>
                    <span className="preset-card__label">{p.label}</span>
                    <span className="preset-card__desc">{p.description}</span>
                </button>
            ))}
        </div>
    );
}
