import { create } from 'zustand';

export type ThemeMode = 'museum' | 'darkroom';
export type EffectType = 'none' | 'ascii' | 'matrix' | 'neon' | 'hologram' | 'particle' | 'crt';

interface AppState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  
  activeEffect: EffectType;
  setActiveEffect: (effect: EffectType) => void;
  
  intensity: number;
  setIntensity: (intensity: number) => void;
  
  capturedImages: string[];
  addCapturedImage: (image: string) => void;
  removeCapturedImage: (index: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'darkroom', // Let's default to darkroom based on the UI reference
  setTheme: (theme) => {
    // Apply the dark class to the HTML element for Tailwind
    const root = window.document.documentElement;
    if (theme === 'darkroom') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    set({ theme });
  },
  
  activeEffect: 'none',
  setActiveEffect: (activeEffect) => set({ activeEffect }),
  
  intensity: 70, // Default intensity
  setIntensity: (intensity) => set({ intensity }),
  
  capturedImages: [],
  addCapturedImage: (image) => set((state) => ({ 
    capturedImages: [image, ...state.capturedImages] 
  })),
  removeCapturedImage: (index) => set((state) => ({
    capturedImages: state.capturedImages.filter((_, i) => i !== index)
  }))
}));
