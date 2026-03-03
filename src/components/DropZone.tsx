"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface DropZoneProps {
    label: string;
    icon: string;
    typeBadge: string;
    onFile: (file: File) => void;
    file: File | null;
    preview: string | null;
    onRemove: () => void;
}

export default function DropZone({
    label,
    icon,
    typeBadge,
    onFile,
    file,
    preview,
    onRemove,
}: DropZoneProps) {
    const [dragging, setDragging] = useState(false);

    const onDrop = useCallback(
        (accepted: File[]) => {
            if (accepted[0]) onFile(accepted[0]);
        },
        [onFile]
    );

    const { getRootProps, getInputProps, open } = useDropzone({
        onDrop,
        accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".bmp"] },
        maxSize: 5 * 1024 * 1024,
        multiple: false,
        noClick: !!file,
        onDragEnter: () => setDragging(true),
        onDragLeave: () => setDragging(false),
        onDropAccepted: () => setDragging(false),
        onDropRejected: () => setDragging(false),
    });

    return (
        <div
            {...getRootProps()}
            className={
                "drop-zone" +
                (dragging ? " dragging" : "") +
                (file ? " has-file" : "")
            }
            role="button"
            aria-label={`Upload ${label}`}
            tabIndex={0}
        >
            <input {...getInputProps()} id={`input-${typeBadge.toLowerCase()}`} />

            {file && (
                <button
                    type="button"
                    className="drop-zone__remove"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    aria-label="Remove file"
                >
                    ✕
                </button>
            )}

            {preview ? (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={preview}
                        alt={`${label} preview`}
                        className="drop-zone__preview"
                    />
                    <span className="drop-zone__type-badge">✓ {typeBadge}</span>
                    <span className="drop-zone__filename">
                        {file?.name ?? "Image loaded"}
                    </span>
                    <span className="drop-zone__hint" style={{ fontSize: "0.75rem" }}>
                        Click ✕ to remove or drop a new file
                    </span>
                </>
            ) : (
                <>
                    <span className="drop-zone__icon">{icon}</span>
                    <span className="drop-zone__type-badge">{typeBadge}</span>
                    <span className="drop-zone__label">{label}</span>
                    <span className="drop-zone__hint">
                        Drag & drop or{" "}
                        <span
                            className="drop-zone__browse"
                            onClick={(e) => {
                                e.stopPropagation();
                                open();
                            }}
                        >
                            browse files
                        </span>
                    </span>
                    <span className="drop-zone__hint">JPG, PNG, WEBP · Max 5 MB</span>
                </>
            )}
        </div>
    );
}
