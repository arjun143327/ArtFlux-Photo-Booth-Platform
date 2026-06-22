import { Camera, Image, Wand2, LayoutTemplate, Settings, Sun, Moon } from 'lucide-react';
import { useAppStore, type ThemeMode } from '../store/useAppStore';

export default function Sidebar() {
  const { theme, setTheme } = useAppStore();

  const navItems = [
    { id: 'live', label: 'Live Camera', icon: Camera },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'effects', label: 'Effects', icon: Wand2 },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  return (
    <aside className="w-full md:w-64 bg-museum-surface dark:bg-darkroom-surface border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-800 p-6 flex flex-col justify-between shrink-0 transition-colors duration-300">
      <div className="flex flex-col gap-8">
        {/* Logo Area */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-wider text-museum-text dark:text-darkroom-text">
              ART<span className="text-museum-primary dark:text-darkroom-accent">FLUX</span>
            </span>
          </div>
          {/* Decorative indicator dots */}
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-museum-primary dark:bg-darkroom-accent"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-700"></span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === 'live'; // Hardcoded for now
            
            return (
              <button
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-museum-primary/10 dark:bg-darkroom-accent/10 text-museum-primary dark:text-darkroom-accent'
                    : 'text-gray-500 hover:text-museum-text dark:text-zinc-400 dark:hover:text-darkroom-text hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-museum-primary dark:bg-darkroom-accent hidden md:block" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Theme Switcher & Version info */}
      <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800/80">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block mb-3">
            Theme
          </span>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleThemeChange('museum')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                theme === 'museum'
                  ? 'bg-museum-primary/10 text-museum-primary font-semibold shadow-sm'
                  : 'text-gray-500 hover:text-museum-text dark:text-zinc-400 dark:hover:text-darkroom-text'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span>Museum</span>
              {theme === 'museum' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-museum-primary" />}
            </button>
            <button
              onClick={() => handleThemeChange('darkroom')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                theme === 'darkroom'
                  ? 'bg-darkroom-accent/10 text-darkroom-accent font-semibold shadow-sm'
                  : 'text-gray-500 hover:text-museum-text dark:text-zinc-400 dark:hover:text-darkroom-text'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span>Darkroom</span>
              {theme === 'darkroom' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-darkroom-accent" />}
            </button>
          </div>
        </div>

        <div className="text-[10px] text-gray-400 dark:text-zinc-600 font-mono tracking-wider pt-2">
          v1.0.0
        </div>
      </div>
    </aside>
  );
}
