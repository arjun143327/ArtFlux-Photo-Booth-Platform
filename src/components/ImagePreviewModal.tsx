import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, ChevronLeft, ChevronRight, Trash2, Download } from 'lucide-react';

interface Props {
  index: number;
  onClose: () => void;
  onNavigate?: (newIndex: number) => void;
}

export default function ImagePreviewModal({ index, onClose, onNavigate }: Props) {
  const { capturedImages, removeCapturedImage } = useAppStore();
  const total = capturedImages.length;

  /* ── Keyboard navigation ─────────────────────────────── */

  const goNext = useCallback(() => {
    if (index < total - 1 && onNavigate) onNavigate(index + 1);
  }, [index, total, onNavigate]);

  const goPrev = useCallback(() => {
    if (index > 0 && onNavigate) onNavigate(index - 1);
  }, [index, onNavigate]);

  const handleDelete = useCallback(() => {
    removeCapturedImage(index);
    onClose();
  }, [index, removeCapturedImage, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape': onClose(); break;
        case 'ArrowRight':
          if (index < total - 1) onNavigate?.(index + 1);
          break;
        case 'ArrowLeft':
          if (index > 0) onNavigate?.(index - 1);
          break;
        case 'Delete': case 'Backspace':
          if (!e.repeat) handleDelete();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [index, total, onClose, onNavigate, handleDelete]);

  /* ── Lock body scroll ───────────────────────────────── */

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* ── Download ─────────────────────────────────────────── */

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `artflux-capture-${index + 1}.png`;
    link.href = capturedImages[index];
    link.click();
  };

  /* ── Don't render if index out of bounds ─────────────── */

  if (!capturedImages[index]) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Close button (top-right) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/10 text-white/70
          hover:bg-white/20 hover:text-white transition-all duration-200
          active:scale-90"
        title="Close (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Previous button */}
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-xl
            bg-white/10 text-white/70 hover:bg-white/20 hover:text-white
            transition-all duration-200 active:scale-90"
          title="Previous (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {index < total - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-xl
            bg-white/10 text-white/70 hover:bg-white/20 hover:text-white
            transition-all duration-200 active:scale-90"
          title="Next (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Bottom toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        {/* Counter */}
        <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium">
          {index + 1} of {total}
        </div>

        {/* Download */}
        <button
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          className="p-2 rounded-xl bg-white/10 backdrop-blur-sm text-white/70
            hover:bg-white/20 hover:text-white transition-all duration-200 active:scale-90"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          className="p-2 rounded-xl bg-red-500/20 backdrop-blur-sm text-red-400
            hover:bg-red-500/30 hover:text-red-300 transition-all duration-200 active:scale-90"
          title="Delete (Del)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Image */}
      <div className="relative z-10 max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={capturedImages[index]}
          alt={`Capture ${index + 1}`}
          className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain
            animate-in fade-in zoom-in-95 duration-200"
          style={{ animation: 'none' }}
        />
      </div>
    </div>
  );
}