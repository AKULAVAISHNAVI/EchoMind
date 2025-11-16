import React, { useState, useEffect } from 'react';
import { CustomizationSettings, EchoAvatar, EchoPersonality, Theme, TextSize, Dream } from '../types';
import { APP_THEMES, ECHO_PERSONALITIES } from '../constants';
import { EchoAvatarIcon, XIcon, RefreshCwIcon, CheckBadgeIcon, DownloadIcon, AlertTriangleIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: CustomizationSettings;
  onSave: (settings: CustomizationSettings) => void;
  isNightMode: boolean;
  animationsEnabled: boolean;
  dreams: Dream[];
  clearDreams: () => void;
}

const ThemePreview: React.FC<{ theme: typeof APP_THEMES[keyof typeof APP_THEMES] }> = ({ theme }) => (
    <div className={`w-full h-20 rounded-lg overflow-hidden ${theme.bgDay} p-2 flex flex-col border ${theme.containerBorderNight} shadow-inner`}>
        <div className="w-full h-4 mb-1">
            <div className={`w-1/2 h-2 rounded-full mx-auto ${theme.headerText}`}></div>
            <div className={`w-3/4 h-1 rounded-full mx-auto mt-1 ${theme.subHeaderText} opacity-50`}></div>
        </div>
        <div className={`flex-grow rounded ${theme.containerBgDay} border ${theme.containerBorderDay} p-1.5 flex justify-end items-end`}>
            <div className={`w-1/2 h-3 rounded-full ${theme.userBubbleBg}`}></div>
        </div>
    </div>
);


export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave, isNightMode, animationsEnabled, dreams, clearDreams }) => {
  const [settings, setSettings] = useState(currentSettings);
  const [activeTab, setActiveTab] = useState<'personalization' | 'data'>('personalization');

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(settings);
  };
  
  const handleSurpriseTheme = () => {
    const themeKeys = Object.keys(Theme) as Array<keyof typeof Theme>;
    let randomTheme;
    do {
        const randomIndex = Math.floor(Math.random() * themeKeys.length);
        randomTheme = Theme[themeKeys[randomIndex]];
    } while (randomTheme === settings.theme); // ensure it's a new theme
    setSettings(s => ({...s, theme: randomTheme}));
  };
  
  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dreams, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "echomind_dreams.json";
    link.click();
  };

  const handleClearData = () => {
    if (window.confirm('Are you absolutely sure you want to delete all your dreams? This action cannot be undone.')) {
        clearDreams();
        onClose();
    }
  };


  const TabButton: React.FC<{ tabId: 'personalization' | 'data', children: React.ReactNode }> = ({ tabId, children }) => (
      <button
        onClick={() => setActiveTab(tabId)}
        className={`w-full py-2.5 text-sm font-bold rounded-full transition-all ${animationsEnabled ? 'active:scale-95' : ''} ${
            activeTab === tabId
            ? 'bg-purple-600 text-white shadow'
            : isNightMode
            ? 'text-slate-300 hover:bg-slate-700'
            : 'text-slate-300 hover:bg-slate-700'
        }`}
      >
          {children}
      </button>
  );


  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-3">{children}</h3>
  );

  return (
    <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${animationsEnabled ? 'animate-fade-in-fast' : ''}`}
        onClick={onClose}
    >
      <div 
        className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] transition-colors duration-500 ${isNightMode ? 'bg-slate-900 border-purple-800/40' : 'bg-slate-800 border-purple-500/20'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="p-1 rounded-full text-purple-300 hover:bg-slate-700 transition">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className={`flex items-center p-1 rounded-full mb-6 flex-shrink-0 ${isNightMode ? 'bg-slate-800' : 'bg-slate-700'}`}>
            <TabButton tabId="personalization">Personalization</TabButton>
            <TabButton tabId="data">Data & Accessibility</TabButton>
        </div>
        
        <div className="overflow-y-auto pr-2 -mr-2 flex-grow">
        {activeTab === 'personalization' && (
            <div className="space-y-6">
                {/* Avatar Selection */}
                <div>
                  <SectionTitle>Choose Echo's Look</SectionTitle>
                  <div className="flex justify-around items-center gap-4">
                    {(Object.keys(EchoAvatar) as Array<keyof typeof EchoAvatar>).map(key => (
                      <button
                        key={key}
                        onClick={() => setSettings(s => ({ ...s, avatar: EchoAvatar[key] }))}
                        className={`relative p-4 rounded-full transition-all duration-200 ${animationsEnabled ? 'active:scale-95' : ''} ${settings.avatar === EchoAvatar[key] ? 'bg-purple-600 ring-2 ring-pink-500 shadow-lg' : isNightMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-700 hover:bg-slate-600'}`}
                      >
                        <EchoAvatarIcon avatar={EchoAvatar[key]} className="w-10 h-10 text-white" />
                        {settings.avatar === EchoAvatar[key] && <CheckBadgeIcon className="absolute -top-1 -right-1 w-6 h-6"/>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personality Selection */}
                <div>
                    <SectionTitle>Choose Echo's Personality</SectionTitle>
                    <div className="space-y-3">
                        {(Object.keys(EchoPersonality) as Array<keyof typeof EchoPersonality>).map(key => {
                            const personalityKey = EchoPersonality[key];
                            const personality = ECHO_PERSONALITIES[personalityKey];
                            const isSelected = settings.personality === personalityKey;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSettings(s => ({ ...s, personality: personalityKey }))}
                                    className={`w-full text-left p-3 rounded-lg border-2 flex items-center justify-between transition-all duration-200 ${animationsEnabled ? 'active:scale-95' : ''} ${
                                        isSelected
                                        ? 'border-purple-500 bg-purple-500/20 shadow-md'
                                        : `border-transparent ${isNightMode ? 'hover:bg-slate-800/70' : 'hover:bg-slate-700/70'}`
                                    }`}
                                >
                                    <div>
                                        <p className="font-semibold text-white">{personality.name}</p>
                                        <p className="text-xs text-purple-300">{personality.description}</p>
                                    </div>
                                    {isSelected && <CheckBadgeIcon className="w-6 h-6 flex-shrink-0 ml-4"/>}
                                </button>
                            )
                        })}
                    </div>
                </div>
                
                {/* Theme Selection */}
                <div>
                    <div className="flex justify-between items-center">
                         <SectionTitle>App Theme</SectionTitle>
                         <button 
                            onClick={handleSurpriseTheme}
                            className={`flex items-center gap-1.5 text-xs font-semibold text-purple-300 hover:text-pink-400 transition-colors pr-2 ${animationsEnabled ? 'active:scale-95' : ''}`}
                        >
                            <RefreshCwIcon className="w-3 h-3"/>
                            Surprise Me!
                        </button>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        {(Object.keys(Theme) as Array<keyof typeof Theme>).map(key => {
                            const themeKey = Theme[key];
                            const theme = APP_THEMES[themeKey];
                            const isSelected = settings.theme === themeKey;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSettings(s => ({...s, theme: themeKey}))}
                                    className={`text-center p-2 rounded-lg border-2 transition-all duration-200 ${animationsEnabled ? 'active:scale-95' : ''} ${isSelected ? 'border-pink-500' : 'border-transparent hover:border-slate-600'}`}
                                >
                                    <div className="relative">
                                        <ThemePreview theme={theme} />
                                        {isSelected && <CheckBadgeIcon className="absolute top-1 right-1 w-6 h-6"/>}
                                    </div>
                                    <p className="text-xs text-slate-200 mt-2">{theme.name}</p>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'data' && (
            <div className="space-y-6">
                 {/* Display & Accessibility */}
                <div>
                    <SectionTitle>Display & Accessibility</SectionTitle>
                    <div className="space-y-4 p-3 rounded-lg bg-slate-800/50">
                        {/* Text Size */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Text Size</label>
                            <div className="flex items-center bg-slate-700 rounded-full p-1">
                                {(Object.keys(TextSize) as Array<keyof typeof TextSize>).map(key => (
                                   <button
                                     key={key}
                                     onClick={() => setSettings(s => ({ ...s, textSize: TextSize[key] }))}
                                     className={`w-full text-center px-4 py-1.5 text-xs font-bold rounded-full transition-all ${animationsEnabled ? 'active:scale-95' : ''} ${
                                         settings.textSize === TextSize[key] ? 'bg-purple-600 text-white shadow' : 'text-slate-200'
                                     }`}
                                   >
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                   </button>
                                ))}
                            </div>
                        </div>
                        {/* Reduce Motion */}
                        <div>
                            <div className="flex justify-between items-center">
                                <label htmlFor="reduce-motion" className="text-sm font-medium text-slate-300">Reduce Motion</label>
                                <button
                                    id="reduce-motion"
                                    role="switch"
                                    aria-checked={settings.reduceMotion}
                                    onClick={() => setSettings(s => ({ ...s, reduceMotion: !s.reduceMotion }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.reduceMotion ? 'bg-purple-600' : 'bg-slate-600'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            settings.reduceMotion ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Data Management */}
                <div>
                    <SectionTitle>Data Management</SectionTitle>
                    <div className="space-y-3 p-3 rounded-lg bg-slate-800/50">
                        <button 
                            onClick={handleExport}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold text-white hover:bg-slate-700 transition-colors ${animationsEnabled ? 'active:scale-95' : ''}`}
                        >
                           <DownloadIcon className="w-5 h-5 text-purple-300"/> Export My Dreams
                        </button>
                        <button 
                            onClick={handleClearData}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors ${animationsEnabled ? 'active:scale-95' : ''}`}
                        >
                            <AlertTriangleIcon className="w-5 h-5"/> Clear All Data
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>


        <div className="flex justify-end gap-3 mt-6 flex-shrink-0">
          <button 
            onClick={onClose} 
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${isNightMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-600 hover:bg-slate-500'} ${animationsEnabled ? 'active:scale-95' : ''}`}
            >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className={`px-6 py-2 rounded-full text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-lg ${animationsEnabled ? 'active:scale-95' : ''}`}
            >
            Save Changes
          </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};