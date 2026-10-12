/**
 * CLIENT-SIDE QR GENERATION
 * -------------------------
 * The backend owns the canonical `qrPayload` for a ticket; the browser renders
 * it. This keeps the API free of image-encoding concerns and lets the digital
 * ticket render instantly (and offline) once it has been fetched.
 */
import QRCode from "qrcode";

export interface QrOptions {
  /** Pixels per module — 10 gives a crisp ticket stub at ~280px. */
  scale?: number;
  margin?: number;
  color?: { dark: string; light: string };
}

/** Render a ticket payload to a data URL suitable for <img src>. */
export async function toQrDataUrl(payload: string, options: QrOptions = {}): Promise<string> {
  const { scale = 10, margin = 1, color } = options;
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin,
    width: (scale + margin * 2) * 25,
    color: color ?? { dark: "#05060f", light: "#ffffff" },
  });
}

/** Render to an SVG string — used when the ticket is exported as HTML/PDF. */
export async function toQrSvg(payload: string, options: QrOptions = {}): Promise<string> {
  return QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: options.margin ?? 1,
    color: options.color ?? { dark: "#05060f", light: "#ffffff" },
  });
}
