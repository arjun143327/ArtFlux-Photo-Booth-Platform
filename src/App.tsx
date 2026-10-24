import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import Sidebar from './components/sidebar';
import EffectsPanel from './components/EffectsPanel';
import CameraPreview from './components/CameraPreview';
import FilmStripGallery from './components/FilmStripGallery';
import ExportPanel from './components/ExportPanel';

function App() {
  const { theme, setTheme } = useAppStore();

  //initialize theme on mount to ensure the HTML class is correct
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-museum-bg dark:bg-darkroom-bg transition-colors duration-300">

      <Sidebar />
      {/* Main App Content Area */}
      <main className="flex-1 flex flex-col xl:flex-row overflow-hidden">

        {/* Center Panel: Camera & Filmstrip — gets ~60% width */}
        <section className="flex-[3] p-6 flex flex-col gap-6 overflow-y-auto min-w-0">
          <CameraPreview />

          <FilmStripGallery />
        </section>

        {/* Right Middle Panel: Effects Selection */}
        <EffectsPanel />
        {/* Far Right Panel: Export & Recent */}
        <ExportPanel />
      </main>
    </div>
  );
}
export default App;





