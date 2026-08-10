import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Close button (top-right) */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/10 text-white/70 transition-colors duration-200"
        title="Close (Esc)"
      >
        <X className="w-5 h-5" />
      </motion.button>

      {/* Previous button */}
      {index > 0 && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-xl
            bg-white/10 text-white/70 transition-colors duration-200"
          title="Previous (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
      )}

      {/* Next button */}
      {index < total - 1 && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-xl
            bg-white/10 text-white/70 transition-colors duration-200"
          title="Next (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      )}

      {/* Bottom toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3"
      >
        <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium">
          {index + 1} of {total}
        </div>

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          className="p-2 rounded-xl bg-white/10 backdrop-blur-sm text-white/70 transition-colors duration-200"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          className="p-2 rounded-xl bg-red-500/20 backdrop-blur-sm text-red-400
            hover:bg-red-500/30 hover:text-red-300 transition-colors duration-200"
          title="Delete (Del)"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
        className="relative z-10 max-w-[90vw] max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={capturedImages[index]}
          alt={`Capture ${index + 1}`}
          className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
        />
      </motion.div>
    </motion.div>
  );
}