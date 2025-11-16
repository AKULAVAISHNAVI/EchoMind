





import React, { useState, useCallback, PropsWithChildren, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { DreamJournal } from './components/DreamJournal';
import { Dream, View, CustomizationSettings, EchoAvatar, EchoPersonality, Theme, Achievement, TextSize } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { BotIcon, JournalIcon, MoonIcon, SunIcon, SettingsIcon } from './components/Icons';
import { SettingsModal } from './components/SettingsModal';
import { APP_THEMES, ACHIEVEMENTS_LIST } from './constants';
import { useAchievements } from './hooks/useAchievements';
import { AchievementToast } from './components/AchievementToast';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Chat);
  const [dreams, setDreams] = useLocalStorage<Dream[]>('echomind-dreams', []);
  const [isNightMode, setIsNightMode] = useLocalStorage('echomind-night-mode', false);
  const [settings, setSettings] = useLocalStorage<CustomizationSettings>('echomind-settings', {
    avatar: EchoAvatar.Default,
    personality: EchoPersonality.Magical,
    theme: Theme.Default,
    textSize: TextSize.Medium,
    reduceMotion: false,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<Achievement | null>(null);

  const { unlockedAchievementIds, checkAndUnlockAchievements } = useAchievements(setNewlyUnlockedAchievement);
  
  // Check for achievements whenever dreams or settings change
  useEffect(() => {
    checkAndUnlockAchievements(dreams, settings);
  }, [dreams, settings, checkAndUnlockAchievements]);


  const addDream = useCallback((dream: Dream) => {
    setDreams(prevDreams => [dream, ...prevDreams]);
  }, [setDreams]);

  const updateDream = useCallback((updatedDream: Dream) => {
    setDreams(prevDreams =>
      prevDreams.map(d => (d.id === updatedDream.id ? updatedDream : d))
    );
  }, [setDreams]);

  const deleteDream = useCallback((dreamId: string) => {
    setDreams(prevDreams => prevDreams.filter(d => (d.id !== dreamId)));
  }, [setDreams]);

  const clearDreams = useCallback(() => {
    setDreams([]);
  }, [setDreams]);
  
  const handleSaveSettings = (newSettings: CustomizationSettings) => {
    setSettings(newSettings);
    setIsSettingsOpen(false);
  }

  type NavButtonProps = PropsWithChildren<{
    view: View;
    label: string;
  }>;
  
  const themeStyles = APP_THEMES[settings.theme];
  const navButtonActiveClasses = isNightMode ? themeStyles.navButtonActiveNight : themeStyles.navButtonActive;
  const navButtonInactiveClasses = isNightMode ? themeStyles.navButtonInactiveNight : themeStyles.navButtonInactive;
  
  const animationsEnabled = !settings.reduceMotion;

  const textSizeClasses: Record<TextSize, string> = {
      [TextSize.Small]: 'text-sm',
      [TextSize.Medium]: 'text-base',
      [TextSize.Large]: 'text-lg',
  };


  const NavButton = ({ view, label, children }: NavButtonProps) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${animationsEnabled ? 'active:scale-95' : ''} ${
        activeView === view
          ? `${navButtonActiveClasses} text-white shadow-lg`
          : `text-purple-200 ${navButtonInactiveClasses}`
      }`}
      aria-label={label}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen text-white font-sans flex flex-col items-center p-4 transition-colors duration-500 ${isNightMode ? themeStyles.bgNight : themeStyles.bgDay} ${textSizeClasses[settings.textSize]}`}>
       <AchievementToast
        achievement={newlyUnlockedAchievement}
        onDismiss={() => setNewlyUnlockedAchievement(null)}
        animationsEnabled={animationsEnabled}
      />
      <header className="w-full max-w-4xl text-center my-6 relative">
        <h1 className={`text-4xl md:text-5xl font-bold text-transparent bg-clip-text ${themeStyles.headerText}`}>
          EchoMind
        </h1>
        <p className={`${themeStyles.subHeaderText} mt-2`}>Your Personal Dream Listener Buddy</p>
         <div className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center gap-2">
            <button
                onClick={() => setIsSettingsOpen(true)}
                className={`p-2 rounded-full transition-all duration-300 ${isNightMode ? 'bg-black/20 hover:bg-black/40' : 'bg-white/20 hover:bg-white/40'} text-white ${animationsEnabled ? 'active:scale-95' : ''}`}
                aria-label="Customize Echo"
            >
                <SettingsIcon className="w-6 h-6" />
            </button>
            <button
                onClick={() => setIsNightMode(!isNightMode)}
                className={`p-2 rounded-full transition-all duration-300 ${isNightMode ? 'bg-black/20 hover:bg-black/40' : 'bg-white/20 hover:bg-white/40'} text-white ${animationsEnabled ? 'active:scale-95' : ''}`}
                aria-label={isNightMode ? 'Activate Day Mode' : 'Activate Night Mode'}
            >
                {isNightMode ? <SunIcon className="w-6 h-6 text-yellow-300" /> : <MoonIcon className="w-6 h-6" />}
            </button>
        </div>
      </header>
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSave={handleSaveSettings}
        isNightMode={isNightMode}
        animationsEnabled={animationsEnabled}
        dreams={dreams}
        clearDreams={clearDreams}
      />

      <div className={`w-full max-w-4xl flex-grow flex flex-col backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden transition-colors duration-500 border ${isNightMode ? `${themeStyles.containerBgNight} ${themeStyles.containerBorderNight}` : `${themeStyles.containerBgDay} ${themeStyles.containerBorderDay}`}`}>
        <nav className={`flex justify-center p-2 border-b transition-colors duration-500 ${isNightMode ? `${themeStyles.containerBorderNight}` : `${themeStyles.containerBorderDay}`}`}>
          <div className={`flex items-center gap-4 p-1.5 rounded-full transition-colors duration-500 ${isNightMode ? 'bg-black/30' : 'bg-black/20'}`}>
            <NavButton view={View.Chat} label="Chat with Echo">
              <BotIcon className="w-5 h-5" />
            </NavButton>
            <NavButton view={View.Journal} label="Dream Journal">
              <JournalIcon className="w-5 h-5" />
            </NavButton>
          </div>
        </nav>
        
        <main key={activeView} className={`flex-grow p-4 overflow-y-auto ${animationsEnabled ? 'animate-view-in' : ''}`}>
          {activeView === View.Chat ? (
            <ChatWindow 
                key={settings.personality} // Force re-mount on personality change to reset chat
                addDream={addDream} 
                isNightMode={isNightMode} 
                settings={settings}
                themeStyles={themeStyles}
                animationsEnabled={animationsEnabled}
                // FIX: Pass the dreams array to ChatWindow as it's a required prop.
                dreams={dreams}
            />
          ) : (
            <DreamJournal 
                dreams={dreams} 
                isNightMode={isNightMode} 
                onUpdateDream={updateDream} 
                onDeleteDream={deleteDream} 
                themeStyles={themeStyles}
                unlockedAchievementIds={unlockedAchievementIds}
                animationsEnabled={animationsEnabled}
            />
          )}
        </main>
      </div>
      <footer className="text-center py-4 text-xs text-white/40">
        <p>Created with Gemini API</p>
      </footer>
      {animationsEnabled && <style>{`
        @keyframes view-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-view-in {
          animation: view-in 0.4s ease-out;
        }
      `}</style>}
    </div>
  );
};

export default App;
