import { useMemo, useRef, useState } from 'react';
import { useAppStore, type EffectType } from '../store/useAppStore';
import { SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';

interface EffectConfig {
  id: EffectType;
  label: string;
  description: string;
}

const effects: EffectConfig[] = [
  { id: 'none', label: 'Original', description: 'No effect applied' },
  { id: 'ascii', label: 'ASCII', description: 'Text-based artwork' },
  { id: 'matrix', label: 'Matrix', description: 'Animated matrix rain' },
  { id: 'neon', label: 'Neon Edge', description: 'Glowing neon outlines' },
  { id: 'hologram', label: 'Hologram', description: 'Futuristic holographic' },
  { id: 'particle', label: 'Particle', description: 'Particle composition' },
  { id: 'crt', label: 'CRT Retro', description: 'Vintage display aesthetic' },
];

/* ── Deterministic pseudo-random number generator ──────────── */

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/* ── SVG effect preview thumbnails ─────────────────────────── */

function EffectThumbnail({ effect, index }: { effect: EffectType; index: number }) {
  const common = 'w-full h-full rounded-xl';

  switch (effect) {
    case 'none':
      return (
        <svg viewBox="0 0 120 80" className={common} xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="80" rx="6" fill="currentColor" className="text-gray-100 dark:text-zinc-800" />
          <circle cx="40" cy="35" r="12" fill="currentColor" className="text-gray-300 dark:text-zinc-600" />
          <rect x="58" y="22" width="38" height="26" rx="4" fill="currentColor" className="text-gray-300 dark:text-zinc-600" />
          <rect x="20" y="55" width="80" height="4" rx="2" fill="currentColor" className="text-gray-200 dark:text-zinc-700" />
        </svg>
      );
    case 'ascii': {
      const chars = useMemo(() => {
        const rng = seededRandom(index * 739 + 31);
        return Array.from({ length: 8 }, () =>
          Array.from({ length: 18 }, () =>
            String.fromCharCode(33 + Math.floor(rng() * 94))
          )
        );
      }, [index]);

      return (
        <svg viewBox="0 0 120 80" className={common} xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="80" rx="6" fill="currentColor" className="text-zinc-900 dark:text-zinc-950" />
          {chars.map((row, r) =>
            row.map((ch, c) => (
              <text key={`${r}-${c}`} x={4 + c * 6.5} y={10 + r * 9}
                fontSize="5" fill="currentColor"
                className="text-green-500/60 dark:text-green-400/70 font-mono"
              >
                {ch}
              </text>
            ))
          )}
        </svg>
      );
    }
    case 'matrix':
      return (
        <svg viewBox="0 0 120 80" className={common} xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="80" rx="6" fill="currentColor" className="text-black" />
          {[10, 30, 50, 70, 90, 110].map((x, i) => (
            <g key={i}>
              <text x={x} y={15} fontSize="6" fill="currentColor" className="text-green-400/90 font-mono">0</text>
              <text x={x} y={25} fontSize="6" fill="currentColor" className="text-green-400/70 font-mono">1</text>
              <text x={x} y={35} fontSize="6" fill="currentColor" className="text-green-400/50 font-mono">0</text>
              <text x={x} y={45} fontSize="6" fill="currentColor" className="text-green-400/30 font-mono">1</text>
              {x > 30 && <text x={x} y={55} fontSize="6" fill="currentColor" className="text-green-400/20 font-mono">0</text>}
            </g>
          ))}
        </svg>
      );
    case 'neon':
      return (
        <svg viewBox="0 0 120 80" className={common} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id={`glow-${index}`}>
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="120" height="80" rx="6" fill="currentColor" className="text-zinc-950" />
          <rect x="10" y="4" width="100" height="72" rx="4" fill="none"
            stroke="currentColor" strokeWidth="1.5"
            className="text-cyan-400" opacity="0.9"
            filter={`url(#glow-${index})`} />
          <circle cx="60" cy="40" r="18" fill="none"
            stroke="currentColor" strokeWidth="1"
            className="text-pink-400" opacity="0.8"
            filter={`url(#glow-${index})`} />
          <line x1="8" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1" className="text-cyan-400" opacity="0.6" />
          <line x1="8" y1="64" x2="30" y2="64" stroke="currentColor" strokeWidth="1" className="text-cyan-400" opacity="0.6" />
        </svg>
      );
    case 'hologram':
      return (
        <svg viewBox="0 0 120 80" className={common} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`holo-${index}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#7B2FF7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FF6EC7" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <rect width="120" height="80" rx="6" fill="currentColor" className="text-zinc-950" />
          <rect x="8" y="6" width="104" height="68" rx="4" fill={`url(#holo-${index})`} />
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1="8" y1={12 + i * 12} x2="112" y2={12 + i * 12}
              stroke="white" strokeWidth="0.5" opacity="0.15" />
          ))}
          <rect x="8" y="6" width="104" height="68" rx="4" fill="none"
            stroke="white" strokeWidth="0.5" opacity="0.3" />
        </svg>
      );
    case 'particle': {
      const particles = useMemo(() => {
        const rng = seededRandom(index * 739 + 31);
        return Array.from({ length: 40 }, () => ({
          cx: 10 + rng() * 100,
          cy: 8 + rng() * 64,
          r: 1 + rng() * 2.5,
          hue: rng(),
        }));
      }, [index]);

      return (
        <svg viewBox="0 0 120 80" className={common} xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="80" rx="6" fill="currentColor" className="text-zinc-950" />
          {particles.map((p, i) => {
            const colorClass =
              p.hue < 0.33 ? 'text-orange-400' :
              p.hue < 0.66 ? 'text-blue-400' :
              'text-purple-400';
            return (
              <circle key={i}
                cx={p.cx} cy={p.cy} r={p.r}
                fill="currentColor"
                className={colorClass}
                opacity={0.3 + p.hue * 0.6}
              />
            );
          })}
          <circle cx="60" cy="40" r="16" fill="none"
            stroke="currentColor" strokeWidth="0.5" className="text-white/20" />
        </svg>
      );
    }
    case 'crt':
      return (
        <svg viewBox="0 0 120 80" className={common} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`scanlines-${index}`} width="120" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="120" y2="0" stroke="black" strokeWidth="1" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="120" height="80" rx="6" fill="currentColor" className="text-zinc-900" />
          <rect x="4" y="4" width="112" height="72" rx="10"
            fill="currentColor" className="text-blue-900/60" />
          <rect x="4" y="4" width="112" height="72" rx="10" fill={`url(#scanlines-${index})`} />
          <rect x="4" y="4" width="112" height="72" rx="10" fill="none"
            stroke="currentColor" strokeWidth="1" className="text-blue-400/40" />
          <ellipse cx="60" cy="40" rx="30" ry="22" fill="currentColor"
            className="text-blue-400/10" />
          <rect x="4" y="4" width="112" height="72" rx="10" fill="none"
            strokeWidth="2" className="text-zinc-800" transform="rotate(0.5, 60, 40)" />
        </svg>
      );
    default:
      return null;
  }
}

/* ── Intensity Slider ─────────────────────────────────────── */

function IntensitySlider() {
  const { intensity, setIntensity } = useAppStore();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const computeValue = (clientX: number) => {
    if (!trackRef.current) return intensity;
    const rect = trackRef.current.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    return Math.min(100, Math.max(0, Math.round(raw)));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIntensity(computeValue(e.clientX));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIntensity(computeValue(e.clientX));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Pointer may not be captured — safe to ignore
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor="intensity-slider"
          className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Intensity
        </label>
        <span className="text-xs font-mono font-medium tabular-nums text-gray-400 dark:text-zinc-500">
          {intensity}%
        </span>
      </div>

      <div
        id="intensity-slider"
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuenow={intensity}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Effect intensity: ${intensity}%`}
        className="relative h-6 cursor-pointer group touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 10 : 5;
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            setIntensity(Math.min(100, intensity + step));
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            setIntensity(Math.max(0, intensity - step));
          }
        }}
      >
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden">
          {/* Filled portion */}
          <div
            className="h-full rounded-full bg-museum-primary dark:bg-darkroom-accent transition-[width] duration-75"
            style={{ width: `${intensity}%` }}
          />
        </div>

        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full
            bg-white dark:bg-zinc-200 border-2 border-museum-primary dark:border-darkroom-accent
            shadow-sm dark:shadow-black/30
            transition-transform duration-150
            ${isDragging ? 'scale-125' : 'group-hover:scale-110'}`}
          style={{ left: `${intensity}%` }}
        />
      </div>
    </div>
  );
}

/* ── Main Panel ──────────────────────────────────────────── */

export default function EffectsPanel() {
  const { activeEffect, setActiveEffect, setIntensity } = useAppStore();
  const defaultIntensity = 70;

  const handleEffectChange = (id: EffectType) => {
    setActiveEffect(id);
  };

  const handleReset = () => {
    setActiveEffect('none');
    setIntensity(defaultIntensity);
  };

  const isDefault = activeEffect === 'none';

  return (
    <section className="w-full xl:w-[350px] bg-museum-surface dark:bg-darkroom-surface border-l border-gray-200 dark:border-zinc-800 p-5 flex flex-col gap-5 overflow-y-auto shrink-0 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-museum-primary dark:text-darkroom-accent" />
          <h2 className="text-sm font-semibold text-museum-text dark:text-darkroom-text">
            Effects
          </h2>
        </div>
        <button
          onClick={handleReset}
          disabled={isDefault}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
            text-gray-400 dark:text-zinc-500
            hover:text-museum-text dark:hover:text-darkroom-text
            hover:bg-gray-100 dark:hover:bg-zinc-800
            disabled:opacity-30 disabled:pointer-events-none
            transition-all duration-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Effect Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {effects.map((effect, i) => {
          const isActive = activeEffect === effect.id;

          return (
            <button
              key={effect.id}
              onClick={() => handleEffectChange(effect.id)}
              className={`group relative flex flex-col rounded-2xl overflow-hidden text-left
                transition-all duration-200 ease-out
                ${isActive
                  ? 'ring-2 ring-museum-primary dark:ring-darkroom-accent ring-offset-2 ring-offset-museum-surface dark:ring-offset-darkroom-surface shadow-md'
                  : 'hover:ring-1 hover:ring-gray-300 dark:hover:ring-zinc-600 hover:shadow-sm'
                }`}
            >
              {/* Thumbnail / Preview */}
              <div className="aspect-[3/2] bg-gray-50 dark:bg-zinc-900 overflow-hidden">
                <EffectThumbnail effect={effect.id} index={i} />
              </div>

              {/* Label bar */}
              <div className={`px-3 py-2.5 flex items-center justify-between transition-colors duration-200 ${
                isActive
                  ? 'bg-museum-primary/8 dark:bg-darkroom-accent/10'
                  : 'bg-white dark:bg-zinc-800/50 group-hover:bg-gray-50 dark:group-hover:bg-zinc-800'
              }`}>
                <div className="flex flex-col">
                  <span className={`text-xs font-semibold tracking-wide transition-colors duration-200 ${
                    isActive
                      ? 'text-museum-primary dark:text-darkroom-accent'
                      : 'text-museum-text dark:text-darkroom-text'
                  }`}>
                    {effect.label}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 leading-tight mt-0.5">
                    {effect.description}
                  </span>
                </div>

                {/* Active indicator */}
                <span className={`w-2 h-2 rounded-full shrink-0 transition-all duration-200 ${
                  isActive
                    ? 'bg-museum-primary dark:bg-darkroom-accent scale-100'
                    : 'bg-transparent scale-0 group-hover:scale-100 group-hover:bg-gray-300 dark:group-hover:bg-zinc-600'
                }`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Intensity Slider */}
      {activeEffect !== 'none' && (
        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/60">
          <IntensitySlider />
        </div>
      )}

      {/* Tip */}
      {activeEffect === 'none' && (
        <div className="text-center py-6 px-4 bg-gray-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700/50">
          <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">
            Select an effect above to transform your camera feed in real-time.
          </p>
        </div>
      )}

      {/* Version label */}
      <div className="mt-auto pt-4 text-[10px] text-gray-300 dark:text-zinc-700 font-mono tracking-wider text-center">
        v1.0.0 · {effects.length} effects
      </div>
    </section>
  );
}