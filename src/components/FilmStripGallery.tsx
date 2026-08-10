import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Trash2, Image as ImageIcon, Camera } from 'lucide-react';
import ImagePreviewModal from './ImagePreviewModal';

export default function FilmStripGallery() {
  const { capturedImages, removeCapturedImage } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /* ── Scroll shadow detection ────────────────────────── */

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, [capturedImages.length]);

  /* ── Delete with confirmation via right-click context ── */

  const handleDelete = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    removeCapturedImage(index);
    // Close preview if we deleted the previewed image
    if (previewIndex === index) setPreviewIndex(null);
    else if (previewIndex !== null && previewIndex > index) {
      // Adjust preview index for shift
      setPreviewIndex(previewIndex - 1);
    }
  };

  /* ── Scroll arrows ───────────────────────────────────── */

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  /* ── Empty state ─────────────────────────────────────── */

  if (capturedImages.length === 0) {
    return (
      <div className="h-32 bg-museum-surface dark:bg-darkroom-surface rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 shrink-0 flex items-center justify-center gap-3 transition-colors duration-300">
        <Camera className="w-5 h-5 text-gray-300 dark:text-zinc-600" />
        <span className="text-sm text-gray-400 dark:text-zinc-500 font-medium">
          No captures yet — snap a photo above
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="relative shrink-0 transition-colors duration-300">
        {/* Container with gradient fade on edges */}
        <div className="relative bg-museum-surface dark:bg-darkroom-surface rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden transition-colors duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-museum-primary dark:text-darkroom-accent" />
              <span className="text-xs font-semibold text-museum-text dark:text-darkroom-text">
                Captured Images
              </span>
              <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500 ml-1">
                {capturedImages.length}
              </span>
            </div>

            {/* Inline scroll buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="p-1 rounded-lg text-gray-400 dark:text-zinc-500
                  hover:text-museum-text dark:hover:text-darkroom-text
                  hover:bg-gray-100 dark:hover:bg-zinc-800
                  disabled:opacity-20 disabled:pointer-events-none
                  transition-all duration-200"
                title="Scroll left"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="p-1 rounded-lg text-gray-400 dark:text-zinc-500
                  hover:text-museum-text dark:hover:text-darkroom-text
                  hover:bg-gray-100 dark:hover:bg-zinc-800
                  disabled:opacity-20 disabled:pointer-events-none
                  transition-all duration-200"
                title="Scroll right"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable film strip */}
          <div className="relative">
            {/* Left gradient edge */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-museum-surface dark:from-darkroom-surface to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                canScrollLeft ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Right gradient edge */}
            <div
              className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-museum-surface dark:from-darkroom-surface to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                canScrollRight ? 'opacity-100' : 'opacity-0'
              }`}
            />

            <div
              ref={scrollRef}
              className="flex gap-3 px-5 pb-4 overflow-x-auto overscroll-x-contain
                scroll-smooth snap-x snap-mandatory"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,0,0,0.15) transparent',
              }}
            >
              {capturedImages.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  onClick={() => setPreviewIndex(i)}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative shrink-0 snap-start group outline-none"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative w-[100px] h-[80px] rounded-xl overflow-hidden
                      bg-gray-100 dark:bg-zinc-900
                      ring-1 ring-gray-200 dark:ring-zinc-700
                      group-hover:ring-2 group-hover:ring-museum-primary/40 dark:group-hover:ring-darkroom-accent/40
                      group-focus-visible:ring-2 group-focus-visible:ring-museum-primary dark:group-focus-visible:ring-darkroom-accent
                      transition-all duration-200 ease-out
                      group-hover:scale-[1.03] group-hover:shadow-md"
                  >
                    <img
                      src={src}
                      alt={`Capture ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Delete overlay on hover */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center
                        bg-black/0 group-hover:bg-black/40
                        transition-all duration-200 ${
                        hoveredIndex === i ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <span className="p-1.5 rounded-lg bg-red-500/80 text-white
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        hover:bg-red-500 active:scale-90"
                        onClick={(e) => handleDelete(e, i)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Index label */}
                  <span className="block text-center text-[10px] font-mono text-gray-400 dark:text-zinc-600 mt-1.5 select-none">
                    #{i + 1}
                  </span>
                </button>
              ))}

              {/* End padding for snap */}
              <div className="shrink-0 w-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewIndex !== null && (
        <ImagePreviewModal
          index={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onNavigate={(newIndex) => setPreviewIndex(newIndex)}
        />
      )}
    </>
  );
}