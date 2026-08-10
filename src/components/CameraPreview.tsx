import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type EffectType } from '../store/useAppStore';
import { useEffectPreviews } from '../store/useEffectPreviews';
import { EffectRenderer } from '../utils/effectRenderer';
import {
  CameraOff,
  Loader2,
  Image,
  RefreshCw,
} from 'lucide-react';

type CameraState = 'loading' | 'active' | 'error' | 'unavailable';

export default function CameraPreview() {
  const { activeEffect, intensity, addCapturedImage, capturedImages } = useAppStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<EffectRenderer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [fps, setFps] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [captureFlash, setCaptureFlash] = useState(false);
  const setPreview = useEffectPreviews((s) => s.setPreview);

  const allEffects: EffectType[] = useMemo(
    () => ['none', 'ascii', 'matrix', 'neon', 'hologram', 'particle', 'crt'],
    [],
  );

  /* ── Stop camera helper (always uses latest ref) ───────── */

  const stopCamera = useCallback(() => {
    rendererRef.current?.stop();
    rendererRef.current = null;

    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  /* ── Start camera ─────────────────────────────────────── */

  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    setCameraState('loading');
    setErrorMsg('');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState('unavailable');
        setErrorMsg('Camera API not available in this browser.');
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setCameraState('active');
    } catch (err: unknown) {
      const msg = err instanceof DOMException
        ? err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access.'
          : err.name === 'NotFoundError'
            ? 'No camera found on this device.'
            : `Camera error: ${err.message}`
        : 'Failed to access camera.';

      setCameraState('error');
      setErrorMsg(msg);
    }
  }, []);

  /* ── Initialize camera on mount ───────────────────────── */

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCamera();
    };
    // Only on mount / unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Start renderer when camera becomes active ────────── */

  useEffect(() => {
    if (cameraState !== 'active' || !videoRef.current || !canvasRef.current) return;

    const renderer = new EffectRenderer(videoRef.current, canvasRef.current);
    rendererRef.current = renderer;

    renderer.onFpsUpdate = (f: number) => setFps(f);
    renderer.effect = activeEffect;
    renderer.intensity = intensity;

    renderer.start();

    return () => {
      renderer.stop();
      if (rendererRef.current === renderer) rendererRef.current = null;
    };
  }, [cameraState]);

  /* ── Sync effect / intensity to running renderer ──────── */

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.effect = activeEffect;
    }
  }, [activeEffect]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.intensity = intensity;
    }
  }, [intensity]);

  /* ── Generate live effect thumbnails for the panel ──── */

  useEffect(() => {
    if (cameraState !== 'active') return;

    let cancelled = false;

    const generate = () => {
      if (cancelled) return;
      const renderer = rendererRef.current;
      if (!renderer) return;

      // Generate a thumbnail for each effect at small card size
      for (const effect of allEffects) {
        if (cancelled) break;
        const thumb = renderer.renderThumbnail(effect, intensity, 120, 80);
        if (!cancelled) setPreview(effect, thumb);
      }

      if (!cancelled) {
        timeout = window.setTimeout(generate, 1500);
      }
    };

    let timeout = window.setTimeout(generate, 500);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [cameraState, intensity, allEffects, setPreview]);

  /* ── Resize canvas to fill container ──────────────────── */

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  /* ── Switch camera ────────────────────────────────────── */

  const [switching, setSwitching] = useState(false);

  const switchCamera = useCallback(async () => {
    if (switching) return;
    setSwitching(true);

    // Fully stop the old stream before requesting a new one
    stopCamera();

    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);

    // Small delay to let the old stream fully release (important on iOS/Safari)
    await new Promise(r => setTimeout(r, 150));
    await startCamera(next);

    setSwitching(false);
  }, [facingMode, switching, stopCamera, startCamera]);

  /* ── Capture ──────────────────────────────────────────── */

  const handleCapture = () => {
    const renderer = rendererRef.current;
    if (!renderer || cameraState !== 'active') return;

    const dataUrl = renderer.captureFrame();
    addCapturedImage(dataUrl);

    setCaptureFlash(true);
    setTimeout(() => setCaptureFlash(false), 200);
  };

  /* ── Retry after error ────────────────────────────────── */

  const handleRetry = () => {
    stopCamera();
    startCamera(facingMode);
  };

  /* ── Render ───────────────────────────────────────────── */

  const showOverlay = cameraState === 'active';

  return (
    <div
      ref={containerRef}
      className="relative flex-1 bg-museum-surface dark:bg-darkroom-surface rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden min-h-[400px] transition-colors duration-300"
    >
      {/* Hidden video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />

      {/* Main effect canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Capture flash overlay */}
      {captureFlash && (
        <div className="absolute inset-0 bg-white/60 dark:bg-white/20 z-30 pointer-events-none animate-pulse" />
      )}

      {/* ── Overlay states (loading, error, unavailable) ── */}
      <AnimatePresence>
        {cameraState === 'unavailable' && (
          <motion.div
            key="unavailable"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-400 dark:text-zinc-500"
          >
            <CameraOff className="w-12 h-12" />
            <p className="text-sm font-medium">Camera not available</p>
            <p className="text-xs text-center max-w-xs">{errorMsg}</p>
          </motion.div>
        )}

        {cameraState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-zinc-500"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-8 h-8" />
            </motion.div>
            <p className="text-sm font-medium">Starting camera...</p>
          </motion.div>
        )}

        {cameraState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center"
          >
            <CameraOff className="w-12 h-12 text-red-400" />
            <div>
              <p className="text-sm font-semibold text-red-500 mb-1">Camera Error</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm">{errorMsg}</p>
            </div>
            <motion.button
              onClick={handleRetry}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl
                bg-museum-primary/10 dark:bg-darkroom-accent/10
                text-museum-primary dark:text-darkroom-accent
                hover:bg-museum-primary/20 dark:hover:bg-darkroom-accent/20
                transition-colors duration-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Camera overlay controls ────────────────────── */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none"
          >
            {/* Top status bar */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex items-center justify-between px-4 pt-3 pointer-events-auto"
            >
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg
                bg-black/50 backdrop-blur-sm text-white/90 text-[10px] font-medium tracking-wide">
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-green-400"
                />
                <span>LIVE</span>
                <span className="text-white/50">|</span>
                <motion.span
                  key={fps}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {fps} FPS
                </motion.span>
              </div>

              <motion.button
                onClick={switchCamera}
                disabled={switching}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-black/50 backdrop-blur-sm text-white/80
                  hover:text-white hover:bg-black/60 transition-colors duration-200
                  disabled:opacity-40 disabled:cursor-wait"
                title="Switch camera"
              >
                <motion.span
                  animate={switching ? { rotate: 360 } : { rotate: 0 }}
                  transition={switching ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.span>
              </motion.button>
            </motion.div>

            {/* Bottom controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="flex items-center justify-center gap-6 pb-6 pointer-events-auto"
            >
              {/* Gallery shortcut */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group p-2 rounded-xl bg-black/50 backdrop-blur-sm
                  text-white/80 hover:text-white hover:bg-black/60
                  transition-colors duration-200"
                title="Gallery"
              >
                <Image className="w-5 h-5" />
                {capturedImages.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center
                      text-[9px] font-bold text-white bg-museum-primary dark:bg-darkroom-accent rounded-full"
                  >
                    {capturedImages.length}
                  </motion.span>
                )}
              </motion.button>

              {/* Capture button */}
              <motion.button
                onClick={handleCapture}
                disabled={cameraState !== 'active'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="relative flex items-center justify-center w-16 h-16 rounded-full
                  bg-white/20 backdrop-blur-md border-2 border-white/60
                  hover:bg-white/30 hover:border-white/80
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-colors duration-200 group"
                title="Capture photo"
              >
                <span className="w-10 h-10 rounded-full bg-white group-hover:bg-white/90 transition-colors" />
              </motion.button>

              {/* Spacer to keep capture centered */}
              <div className="w-10" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}