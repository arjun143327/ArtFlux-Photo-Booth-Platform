import { jsPDF } from 'jspdf';
import { useAppStore } from '../store/useAppStore';
import { Download, Images, LayoutTemplate } from 'lucide-react';
import { useState } from 'react';

export default function ExportPanel() {
  const { capturedImages, theme } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);

  // Helper to crop wide images into 1:1 squares
  const cropToSquare = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
        ctx?.drawImage(img, startX, startY, size, size, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = dataUrl;
    });
  };

  const generatePDF = async () => {
    if (capturedImages.length === 0) return;
    setIsExporting(true);

    try {
      // 2x6 inch strip is roughly 50.8mm x 152.4mm
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [50.8, 152.4]
      });

      // Get dynamic theme colors from CSS variables
      const computedStyle = getComputedStyle(document.documentElement);
      const bgColor = theme === 'darkroom' 
        ? computedStyle.getPropertyValue('--color-darkroom-bg').trim() || '#0F0F10'
        : computedStyle.getPropertyValue('--color-museum-bg').trim() || '#F5F1E8';
      const textColor = theme === 'darkroom'
        ? computedStyle.getPropertyValue('--color-darkroom-text').trim() || '#FAFAFA'
        : computedStyle.getPropertyValue('--color-museum-text').trim() || '#111111';

      // Fill background based on theme
      doc.setFillColor(bgColor);
      doc.rect(0, 0, 50.8, 152.4, 'F');

      const padding = 4;
      const width = 50.8 - (padding * 2);
      const height = width; // Square 1:1
      let currentY = padding;

      // Use exactly 3 images (or less if they only took 1 or 2)
      const imagesToExport = capturedImages.slice(0, 3);

      for (let i = 0; i < imagesToExport.length; i++) {
        // Crop the image to a perfect square before adding to PDF
        const squareImgData = await cropToSquare(imagesToExport[i]);
        doc.addImage(squareImgData, 'JPEG', padding, currentY, width, height);
        currentY += height + padding;
      }

      // Add logo/branding at the bottom center
      doc.setTextColor(textColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      // Push it to the bottom explicitly: 152.4 - 8mm for margin
      const textY = 152.4 - 8; 
      doc.text('ARTFLUX', 50.8 / 2, textY, { align: 'center' });
      
      doc.setFontSize(5);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString(), 50.8 / 2, textY + 4, { align: 'center' });

      doc.save('artflux-photostrip.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadAll = () => {
    capturedImages.forEach((img, index) => {
      // A small timeout helps prevent browser blocking for multiple downloads
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = img;
        link.download = `artflux-capture-${index + 1}.png`;
        link.click();
      }, index * 200);
    });
  };

  return (
    <section className="flex-1 min-w-[280px] max-w-[320px] bg-museum-surface dark:bg-darkroom-surface border-l border-gray-200 dark:border-zinc-800 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 transition-colors duration-300">
      
      <div>
        <h2 className="text-lg font-bold text-museum-text dark:text-darkroom-text mb-1 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          {capturedImages.length} {capturedImages.length === 1 ? 'photo' : 'photos'} ready
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Photo Strip Export */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-museum-primary/10 dark:bg-darkroom-accent/10 text-museum-primary dark:text-darkroom-accent">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-museum-text dark:text-darkroom-text">Photo Strip</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">PDF Format</p>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
            Generates a classic 2x6" photo booth strip using your {Math.min(capturedImages.length, 3)} most recent photos.
          </p>
          
          <button
            onClick={generatePDF}
            disabled={capturedImages.length === 0 || isExporting}
            className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all
              bg-museum-primary hover:bg-blue-700 text-white
              dark:bg-darkroom-accent dark:hover:bg-yellow-600 dark:text-black
              disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isExporting ? 'Generating...' : 'Create Strip'}
          </button>
        </div>

        {/* Batch Export */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-museum-text dark:text-darkroom-text">Save All</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">PNG Image</p>
            </div>
          </div>
          
          <button
            onClick={downloadAll}
            disabled={capturedImages.length === 0}
            className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all
              border border-gray-300 dark:border-zinc-700
              hover:bg-gray-100 dark:hover:bg-zinc-800
              text-museum-text dark:text-darkroom-text
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download {capturedImages.length} Images
          </button>
        </div>
      </div>

    </section>
  );
}
