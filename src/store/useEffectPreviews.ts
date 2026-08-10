import { create } from 'zustand';
import type { EffectType } from './useAppStore';

interface EffectPreviewsState {
  previews: Partial<Record<EffectType, string>>;
  setPreview: (effect: EffectType, dataUrl: string) => void;
}

export const useEffectPreviews = create<EffectPreviewsState>((set) => ({
  previews: {},
  setPreview: (effect, dataUrl) =>
    set((state) => ({
      previews: { ...state.previews, [effect]: dataUrl },
    })),
}));