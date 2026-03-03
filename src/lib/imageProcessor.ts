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
 * - Smart binary-search compression to hit the target KB range
 * - If image is naturally too small, adds imperceptible fine-grain
 *   noise to pad bytes up to min_kb without visible quality change
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
    onProgress?.(55);

    const targetMinBytes = spec.min_kb * 1024;
    const targetMaxBytes = spec.max_kb * 1024;

    // ── Step 1: Binary-search for quality that fits within [min, max] ──
    let lo = 0.05;
    let hi = 1.0;
    let bestDataUrl = canvas.toDataURL("image/jpeg", 1.0);
    let bestBytes = base64ByteLength(bestDataUrl);

    for (let i = 0; i < 18; i++) {
        const mid = (lo + hi) / 2;
        const candidate = canvas.toDataURL("image/jpeg", mid);
        const bytes = base64ByteLength(candidate);

        if (bytes >= targetMinBytes && bytes <= targetMaxBytes) {
            bestDataUrl = candidate;
            bestBytes = bytes;
            break;
        } else if (bytes > targetMaxBytes) {
            hi = mid;
            // Track the candidate closest to max (still over)
            if (bytes < bestBytes || bestBytes > targetMaxBytes) {
                bestDataUrl = candidate;
                bestBytes = bytes;
            }
        } else {
            // bytes < targetMinBytes — image is naturally too small at this quality
            lo = mid;
            // Track the highest-quality under-min result as fallback
            if (bytes > bestBytes || bestBytes > targetMaxBytes) {
                bestDataUrl = candidate;
                bestBytes = bytes;
            }
        }
    }

    onProgress?.(75);

    // ── Step 2: If still below min_kb, pad with imperceptible noise ──
    bestBytes = base64ByteLength(bestDataUrl);
    if (bestBytes < targetMinBytes) {
        bestDataUrl = await padToMinSize(canvas, ctx, targetMinBytes, targetMaxBytes);
        bestBytes = base64ByteLength(bestDataUrl);
    }

    onProgress?.(90);

    const finalKB = bestBytes / 1024;
    const validationErrors: string[] = [];

    if (finalKB < spec.min_kb)
        validationErrors.push(
            `File size ${finalKB.toFixed(1)} KB is below the minimum ${spec.min_kb} KB`
        );
    if (finalKB > spec.max_kb)
        validationErrors.push(
            `File size ${finalKB.toFixed(1)} KB exceeds the maximum ${spec.max_kb} KB`
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

/**
 * Adds progressively stronger imperceptible fine-grain noise to a canvas
 * until the JPEG output reaches targetMinBytes — binary-searches noise intensity.
 * Noise is applied at sub-pixel level (±1 per channel) and is visually invisible.
 */
async function padToMinSize(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    targetMinBytes: number,
    targetMaxBytes: number
): Promise<string> {
    // Save original pixel data so we can non-destructively add noise layers
    const original = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let lo = 0;
    let hi = 4; // noise amplitude in [0,255] per channel — we keep it tiny (max 4)
    let bestUrl = canvas.toDataURL("image/jpeg", 0.95);

    for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        if (mid < 0.05) break; // noise too small to be meaningful

        // Restore clean image, then overlay noise
        ctx.putImageData(original, 0, 0);
        applyNoise(ctx, canvas.width, canvas.height, mid);

        const candidate = canvas.toDataURL("image/jpeg", 0.95);
        const bytes = base64ByteLength(candidate);

        if (bytes >= targetMinBytes && bytes <= targetMaxBytes) {
            bestUrl = candidate;
            break;
        } else if (bytes < targetMinBytes) {
            lo = mid;
            bestUrl = candidate; // still the best we have (closest from below)
        } else {
            hi = mid;
            bestUrl = candidate;
        }
    }

    // Restore the canvas to its original clean state
    ctx.putImageData(original, 0, 0);
    return bestUrl;
}

/**
 * Applies uniform random noise of given amplitude to every pixel.
 * Amplitude should be kept very small (≤ 4) so it's visually imperceptible.
 */
function applyNoise(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    amplitude: number
): void {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const amp = Math.max(0, Math.round(amplitude));
    if (amp === 0) return;

    for (let i = 0; i < data.length; i += 4) {
        // R, G, B — skip Alpha (index i+3)
        data[i] = clamp(data[i] + (Math.random() * 2 - 1) * amp);
        data[i + 1] = clamp(data[i + 1] + (Math.random() * 2 - 1) * amp);
        data[i + 2] = clamp(data[i + 2] + (Math.random() * 2 - 1) * amp);
    }

    ctx.putImageData(imageData, 0, 0);
}

function clamp(v: number): number {
    return Math.max(0, Math.min(255, Math.round(v)));
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
