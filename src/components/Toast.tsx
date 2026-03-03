"use client";

import { useState, useEffect } from "react";

interface Toast {
    id: number;
    message: string;
    type: "success" | "error" | "warning";
}

let toastIdCounter = 0;
const listeners: ((t: Toast) => void)[] = [];

export function showToast(
    message: string,
    type: Toast["type"] = "success"
) {
    const t: Toast = { id: ++toastIdCounter, message, type };
    listeners.forEach((fn) => fn(t));
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const handler = (t: Toast) => {
            setToasts((prev) => [...prev, t]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((x) => x.id !== t.id));
            }, 4000);
        };
        listeners.push(handler);
        return () => {
            const idx = listeners.indexOf(handler);
            if (idx > -1) listeners.splice(idx, 1);
        };
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container" role="status" aria-live="polite">
            {toasts.map((t) => (
                <div key={t.id} className={`toast ${t.type}`}>
                    {t.type === "success" && "✅"}
                    {t.type === "error" && "❌"}
                    {t.type === "warning" && "⚠️"}
                    <span>{t.message}</span>
                </div>
            ))}
        </div>
    );
}
