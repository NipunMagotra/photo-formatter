import { ImageSpec } from "./presets";

export interface ProcessingResult {
    dataUrl: string;
    width: number;
    height: number;
    sizeKB: number;
    format: string;
    valid: boolean;
    validationErrors: string[];
}

/**
 * Processes an image client-side using Canvas API:
 * - Resize to exact dimensions
 * - Enforce white background
 * - Convert to JPEG
 * - Smart compress to target KB range
 */
export async function processImage(
    file: File,
    spec: ImageSpec,
    onProgress?: (pct: number) => void
): Promise<ProcessingResult> {
    onProgress?.(10);

    const imageBitmap = await createImageBitmap(file);
    onProgress?.(30);

    const canvas = document.createElement("canvas");
    canvas.width = spec.width;
    canvas.height = spec.height;
    const ctx = canvas.getContext("2d")!;

    // Enforce white background (handles transparent PNGs)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, spec.width, spec.height);

    // Smart cover crop: centre the image while filling the canvas
    const scale = Math.max(
        spec.width / imageBitmap.width,
        spec.height / imageBitmap.height
    );
    const scaledW = imageBitmap.width * scale;
    const scaledH = imageBitmap.height * scale;
    const offsetX = (spec.width - scaledW) / 2;
    const offsetY = (spec.height - scaledH) / 2;

    ctx.drawImage(imageBitmap, offsetX, offsetY, scaledW, scaledH);
    onProgress?.(60);

    // Binary-search compression to hit target KB range
    const targetMinBytes = spec.min_kb * 1024;
    const targetMaxBytes = spec.max_kb * 1024;

    let lo = 0.1;
    let hi = 1.0;
    let bestDataUrl = "";
    let iterations = 0;

    // First try at high quality
    bestDataUrl = canvas.toDataURL("image/jpeg", hi);

    while (iterations < 15) {
        const mid = (lo + hi) / 2;
        const candidate = canvas.toDataURL("image/jpeg", mid);
        const bytes = base64ByteLength(candidate);

        if (bytes >= targetMinBytes && bytes <= targetMaxBytes) {
            bestDataUrl = candidate;
            break;
        } else if (bytes > targetMaxBytes) {
            hi = mid;
            bestDataUrl = candidate;
        } else {
            lo = mid;
        }
        iterations++;
    }

    // If still not in range, pick closest quality that stays under max
    if (!bestDataUrl) {
        bestDataUrl = canvas.toDataURL("image/jpeg", hi);
    }

    onProgress?.(90);

    const finalBytes = base64ByteLength(bestDataUrl);
    const finalKB = finalBytes / 1024;

    const validationErrors: string[] = [];
    if (finalKB < spec.min_kb)
        validationErrors.push(
            `File size ${finalKB.toFixed(1)} KB is below minimum ${spec.min_kb} KB`
        );
    if (finalKB > spec.max_kb)
        validationErrors.push(
            `File size ${finalKB.toFixed(1)} KB exceeds maximum ${spec.max_kb} KB`
        );

    onProgress?.(100);

    return {
        dataUrl: bestDataUrl,
        width: spec.width,
        height: spec.height,
        sizeKB: parseFloat(finalKB.toFixed(1)),
        format: "JPG",
        valid: validationErrors.length === 0,
        validationErrors,
    };
}

function base64ByteLength(dataUrl: string): number {
    const base64 = dataUrl.split(",")[1] ?? "";
    const padding = (base64.match(/=/g) ?? []).length;
    return (base64.length * 3) / 4 - padding;
}

/**
 * Triggers a browser download of a data URL
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
