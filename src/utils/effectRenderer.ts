import type { EffectType } from '../store/useAppStore';

/* ── Helpers ──────────────────────────────────────────────── */

function clamp(v: number, min = 0, max = 255): number {
  return Math.min(max, Math.max(min, v));
}

function toGrayscale(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/* ── Simple LCG (faster than Math.random) ─────────────────── */

function lcg(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 0x100000000;
  };
}

/* ── Offscreen buffer pool ────────────────────────────────── */

let _offscreen: HTMLCanvasElement | null = null;
let _asciiCanvas: HTMLCanvasElement | null = null;

function getOffscreen(w: number, h: number): HTMLCanvasElement {
  if (!_offscreen || _offscreen.width !== w || _offscreen.height !== h) {
    _offscreen = document.createElement('canvas');
    _offscreen.width = w;
    _offscreen.height = h;
  }
  return _offscreen;
}

/* ── Pixel shader dispatch ────────────────────────────────── */

function processPixels(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  effect: EffectType,
  intensity: number,
  frame: number,
): void {
  const t = intensity / 100; // 0..1

  switch (effect) {
    case 'matrix':  return applyMatrix(data, w, h, t, frame);
    case 'neon':    return applyNeon(data, w, h, t);
    case 'hologram':return applyHologram(data, w, h, t, frame);
    case 'crt':     return applyCrt(data, w, h, t, frame);
    default:        break;
  }
}

/* ── Matrix ───────────────────────────────────────────────── */

function applyMatrix(data: Uint8ClampedArray, _w: number, _h: number, t: number, _frame: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const gray = toGrayscale(data[i], data[i + 1], data[i + 2]);
    const g = clamp(gray + 40 * t);
    data[i]     = clamp(gray * 0.15);
    data[i + 1] = clamp(g * (0.7 + 0.3 * t));
    data[i + 2] = clamp(gray * 0.1);
    data[i + 3] = 255;
  }
}

/* ── Neon Edge (Sobel) ────────────────────────────────────── */

function applyNeon(data: Uint8ClampedArray, w: number, h: number, t: number): void {
  const len = data.length;
  const gray = new Uint8ClampedArray(w * h);

  for (let i = 0, p = 0; i < len; i += 4, p++) {
    gray[p] = toGrayscale(data[i], data[i + 1], data[i + 2]) | 0;
  }

  const sensitivity = 30 + t * 120;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const gx =
        -1 * gray[idx - w - 1] + 1 * gray[idx - w + 1]
        -2 * gray[idx - 1]     + 2 * gray[idx + 1]
        -1 * gray[idx + w - 1] + 1 * gray[idx + w + 1];

      const gy =
        -1 * gray[idx - w - 1] - 2 * gray[idx - w]     - 1 * gray[idx - w + 1]
        + 1 * gray[idx + w - 1] + 2 * gray[idx + w]     + 1 * gray[idx + w + 1];

      const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      const pixel = (y * w + x) * 4;

      if (mag > sensitivity) {
        const angle = Math.atan2(gy, gx);
        data[pixel]     = clamp(128 + 127 * Math.sin(angle) * t);
        data[pixel + 1] = clamp(128 + 127 * Math.sin(angle + 2.09) * t);
        data[pixel + 2] = clamp(128 + 127 * Math.sin(angle + 4.19) * t);
        data[pixel + 3] = 255;
      } else {
        data[pixel] = data[pixel + 1] = data[pixel + 2] = clamp(mag * 0.15);
        data[pixel + 3] = 255;
      }
    }
  }
}

/* ── Hologram ─────────────────────────────────────────────── */

function applyHologram(data: Uint8ClampedArray, _w: number, _h: number, t: number, _frame: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    data[i]     = clamp(r * (1 + 0.3 * t) + b * 0.15 * t);
    data[i + 1] = clamp(g * (1 + 0.2 * t));
    data[i + 2] = clamp(b * (1 + 0.4 * t) + r * 0.15 * t);
    data[i + 3] = 255;
  }
}

/* ── CRT ──────────────────────────────────────────────────── */

function applyCrt(data: Uint8ClampedArray, _w: number, _h: number, t: number, _frame: number): void {
  const noiseAmount = t * 40;
  // Pre-compute a noise buffer for this frame (faster than Math.random per pixel)
  const noiseLen = Math.min(data.length, 1024);
  const noise = new Uint8ClampedArray(noiseLen);
  const rng = lcg(_frame * 7919 + 1);
  for (let i = 0; i < noiseLen; i++) {
    noise[i] = (rng() - 0.5) * noiseAmount * 2;
  }

  for (let i = 0; i < data.length; i += 4) {
    const n = noise[i % noiseLen];
    data[i]     = clamp(data[i]     + n);
    data[i + 1] = clamp(data[i + 1] + n);
    data[i + 2] = clamp(data[i + 2] + n);
  }
}

/* ── ASCII render ─────────────────────────────────────────── */

const ASCII_CHARS = '@%#*+=-:. ';

function renderAscii(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  dstW: number,
  dstH: number,
  intensity: number,
): void {
  const density = 0.3 + (intensity / 100) * 0.7;
  const cols = Math.floor(80 * density);
  const rows = Math.floor((cols * dstH) / dstW / 1.8);

  const cellW = dstW / cols;
  const cellH = dstH / rows;

  if (!_asciiCanvas || _asciiCanvas.width !== cols || _asciiCanvas.height !== rows) {
    _asciiCanvas = document.createElement('canvas');
    _asciiCanvas.width = cols;
    _asciiCanvas.height = rows;
  }
  const ascCtx = _asciiCanvas.getContext('2d', { willReadFrequently: true })!;
  ascCtx.drawImage(video, 0, 0, cols, rows);
  const src = ascCtx.getImageData(0, 0, cols, rows).data;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, dstW, dstH);

  const contrast = 0.5 + (intensity / 100) * 0.5;
  ctx.font = `bold ${Math.ceil(cellH)}px "Courier New", monospace`;
  ctx.textBaseline = 'top';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = (r * cols + c) * 4;
      let gray = toGrayscale(src[idx], src[idx + 1], src[idx + 2]);
      gray = clamp(((gray - 128) * contrast + 128));
      const chIdx = Math.floor((gray / 255) * (ASCII_CHARS.length - 1));
      const ch = ASCII_CHARS[ASCII_CHARS.length - 1 - chIdx];

      ctx.fillStyle = `rgb(${clamp(gray + 60)}, ${clamp(gray + 40)}, ${clamp(gray - 20)})`;
      ctx.fillText(ch, c * cellW, r * cellH);
    }
  }
}

/* ── Particle render ──────────────────────────────────────── */

function renderParticle(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  dstW: number,
  dstH: number,
  intensity: number,
  frame: number,
): void {
  const count = Math.floor(30 + (intensity / 100) * 70);
  const scale = 6 + Math.floor((1 - intensity / 100) * 14);

  const sW = Math.ceil(dstW / scale);
  const sH = Math.ceil(dstH / scale);

  if (!_asciiCanvas || _asciiCanvas.width !== sW || _asciiCanvas.height !== sH) {
    _asciiCanvas = document.createElement('canvas');
    _asciiCanvas.width = sW;
    _asciiCanvas.height = sH;
  }
  const ascCtx = _asciiCanvas.getContext('2d', { willReadFrequently: true })!;
  ascCtx.drawImage(video, 0, 0, sW, sH);
  const src = ascCtx.getImageData(0, 0, sW, sH).data;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, dstW, dstH);

  const rng = lcg(frame * 1337 + 42);
  for (let i = 0; i < count; i++) {
    const sx = Math.floor(rng() * sW);
    const sy = Math.floor(rng() * sH);
    const idx = (sy * sW + sx) * 4;

    const radius = 1 + (intensity / 100) * 4;
    ctx.beginPath();
    ctx.arc(sx * scale + rng() * scale, sy * scale + rng() * scale, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${src[idx]},${src[idx + 1]},${src[idx + 2]})`;
    ctx.fill();
  }
}

/* ── Scanline overlay ─────────────────────────────────────── */

function drawScanlines(ctx: CanvasRenderingContext2D, w: number, h: number, opacity: number): void {
  ctx.fillStyle = `rgba(0,0,0,${opacity})`;
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }
}

/* ── Vignette ─────────────────────────────────────────────── */

function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const gradient = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.75);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

/* ── Compute source rect for object-fit: cover ────────────── */

function computeCoverRect(
  videoW: number, videoH: number,
  canvasW: number, canvasH: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const videoAspect = videoW / videoH;
  const canvasAspect = canvasW / canvasH;

  if (videoAspect > canvasAspect) {
    // Video is wider – crop horizontally
    const sw = videoH * canvasAspect;
    return { sx: (videoW - sw) / 2, sy: 0, sw, sh: videoH };
  } else {
    // Video is taller – crop vertically
    const sh = videoW / canvasAspect;
    return { sx: 0, sy: (videoH - sh) / 2, sw: videoW, sh };
  }
}

/* ── Main renderer class ──────────────────────────────────── */

export class EffectRenderer {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private frameId = 0;
  private running = false;
  private _effect: EffectType = 'none';
  private _intensity = 70;
  private fpsSamples: number[] = [];
  private frameCount = 0;
  public onFpsUpdate?: (fps: number) => void;

  constructor(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    this.video = video;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  }

  set effect(e: EffectType) { this._effect = e; }
  set intensity(v: number) { this._intensity = v; }

  get effect() { return this._effect; }
  get intensity() { return this._intensity; }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.tick(performance.now());
  }

  stop(): void {
    this.running = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    this.frameId = requestAnimationFrame(this.tick);

    const video = this.video;
    if (video.readyState < 2) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w === 0 || h === 0) return;

    const vw = video.videoWidth || w;
    const vh = video.videoHeight || h;
    const { sx, sy, sw, sh } = computeCoverRect(vw, vh, w, h);

    const ctx = this.ctx;
    const effect = this._effect;
    const frame = this.frameCount++;

    if (effect === 'none') {
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
    } else if (effect === 'ascii') {
      renderAscii(ctx, video, w, h, this._intensity);
    } else if (effect === 'particle') {
      renderParticle(ctx, video, w, h, this._intensity, frame);
    } else {
      // Pixel-shader effects – process at ½ resolution, then scale up
      const offscreen = getOffscreen(w, h);
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true })!;

      const sw2 = Math.round(w / 2);
      const sh2 = Math.round(h / 2);
      offscreen.width = sw2;
      offscreen.height = sh2;

      offCtx.drawImage(video, sx, sy, sw, sh, 0, 0, sw2, sh2);
      const img = offCtx.getImageData(0, 0, sw2, sh2);
      processPixels(img.data, sw2, sh2, effect, this._intensity, frame);
      offCtx.putImageData(img, 0, 0);

      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(offscreen, 0, 0, w, h);
    }

    // Post-process overlays
    if (effect === 'crt') {
      drawScanlines(ctx, w, h, 0.08 + (this._intensity / 100) * 0.12);
    }
    if (effect === 'hologram') {
      drawScanlines(ctx, w, h, 0.04 + (this._intensity / 100) * 0.08);
    }

    drawVignette(ctx, w, h);

    // FPS tracking
    this.fpsSamples.push(now);
    while (this.fpsSamples.length > 0 && this.fpsSamples[0] < now - 1000) {
      this.fpsSamples.shift();
    }
    if (this.fpsSamples.length % 15 === 0) {
      this.onFpsUpdate?.(this.fpsSamples.length);
    }
  };

  /* ── Capture current frame ────────────────────────────── */

  captureFrame(): string {
    const cap = document.createElement('canvas');
    cap.width = this.canvas.width;
    cap.height = this.canvas.height;
    const capCtx = cap.getContext('2d')!;
    capCtx.drawImage(this.canvas, 0, 0);
    return cap.toDataURL('image/png');
  }
}