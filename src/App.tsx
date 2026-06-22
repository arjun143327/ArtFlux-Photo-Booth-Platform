import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import Sidebar from './components/sidebar';

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

        {/* Center Panel: Camera & Filmstrip */}
        <section className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="flex-1 bg-museum-surface dark:bg-darkroom-surface rounded-2xl border border-gray-200 dark:border-zinc-800 flex items-center justify-center min-h-[400px]">
             <span className="text-gray-400 font-medium">Camera Preview Container</span>
          </div>

          <div className="h-32 bg-museum-surface dark:bg-darkroom-surface rounded-2xl border border-gray-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
             <span className="text-gray-400 font-medium">Film Strip Gallery</span>
          </div>
        </section>

        {/* Right Middle Panel: Effects Selection */}
        <section className="w-full xl:w-[350px] bg-museum-surface dark:bg-darkroom-surface border-l border-gray-200 dark:border-zinc-800 p-6 overflow-y-auto shrink-0">
           <span className="text-gray-400 font-medium">Effects Panel Container</span>
        </section>
        {/* Far Right Panel: Export & Recent */}
        <section className="w-full xl:w-[280px] bg-museum-surface dark:bg-darkroom-surface border-l border-gray-200 dark:border-zinc-800 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
           <span className="text-gray-400 font-medium">Export Panel Container</span>
        </section>
      </main>
    </div>
  );
}
export default App;





