import React, { useState, useMemo } from 'react';
import { Dream, Mood, AchievementId } from '../types';
import { DreamCard } from './DreamCard';
import { JournalIcon, FireIcon, ChartBarIcon, CloudIcon, TrophyIcon, CalendarDaysIcon, LoadingIcon, SparklesIcon } from './Icons';
import { MOOD_OPTIONS, APP_THEMES } from '../constants';
import { MoodChart } from './MoodChart';
import { DreamCloud } from './DreamCloud';
import { AchievementsGrid } from './AchievementsGrid';
import { MoodCalendar } from './MoodCalendar';
import { getSymbolMeaning } from '../services/geminiService';

interface DreamJournalProps {
  dreams: Dream[];
  isNightMode: boolean;
  onUpdateDream: (dream: Dream) => void;
  onDeleteDream: (id: string) => void;
  themeStyles: typeof APP_THEMES[keyof typeof APP_THEMES];
  unlockedAchievementIds: Set<AchievementId>;
  animationsEnabled: boolean;
}

const calculateStreak = (dreams: Dream[]): number => {
    if (dreams.length === 0) return 0;

    const sortedDates = dreams
        .map(d => new Date(d.date).setHours(0, 0, 0, 0))
        .filter(d => !isNaN(d));
    
    const uniqueDates = [...new Set(sortedDates)].sort((a, b) => b - a);

    if (uniqueDates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = new Date(today).setDate(new Date(today).getDate() - 1);

    // Check if the most recent dream is from today or yesterday
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        streak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const currentDay = uniqueDates[i];
            const previousDay = uniqueDates[i+1];
            const expectedPreviousDay = new Date(currentDay).setDate(new Date(currentDay).getDate() - 1);

            if (previousDay === expectedPreviousDay) {
                streak++;
            } else {
                break;
            }
        }
    }
    
    return streak;
}


export const DreamJournal: React.FC<DreamJournalProps> = ({ dreams, isNightMode, onUpdateDream, onDeleteDream, themeStyles, unlockedAchievementIds, animationsEnabled }) => {
  const [activeFilter, setActiveFilter] = useState<Mood | 'All'>('All');
  const [journalView, setJournalView] = useState<'list' | 'trends' | 'cloud' | 'achievements' | 'calendar'>('list');
  
  const [symbolQuery, setSymbolQuery] = useState('');
  const [symbolMeaning, setSymbolMeaning] = useState('');
  const [isSymbolLoading, setIsSymbolLoading] = useState(false);
  const [symbolError, setSymbolError] = useState('');

  const streak = useMemo(() => calculateStreak(dreams), [dreams]);

  const filteredDreams = dreams.filter(dream => {
    if (activeFilter === 'All') return true;
    return dream.mood === activeFilter;
  });

  const moodFrequencies = useMemo(() => {
    if (!dreams.length) return [];
    
    const counts = dreams.reduce((acc, dream) => {
        if (dream.mood) {
            acc[dream.mood] = (acc[dream.mood] || 0) + 1;
        }
        return acc;
    }, {} as Record<Mood, number>);

    return MOOD_OPTIONS.map(option => ({
        ...option,
        count: counts[option.mood] || 0,
    })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

  }, [dreams]);

  const handleSymbolLookup = async () => {
    if (!symbolQuery.trim()) return;
    setIsSymbolLoading(true);
    setSymbolMeaning('');
    setSymbolError('');
    try {
        const meaning = await getSymbolMeaning(symbolQuery);
        setSymbolMeaning(meaning);
    } catch (error) {
        setSymbolError('Could not fetch meaning. Please try again.');
    } finally {
        setIsSymbolLoading(false);
    }
  }

  const ViewToggleButton: React.FC<{
      label: string;
      isActive: boolean;
      onClick: () => void;
      children: React.ReactNode;
  }> = ({ label, isActive, onClick, children }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${animationsEnabled ? 'active:scale-95' : ''} ${
        isActive
          ? `${isNightMode ? themeStyles.navButtonActiveNight : themeStyles.navButtonActive} text-white shadow-lg`
          : `text-white/70 ${isNightMode ? themeStyles.navButtonInactiveNight : themeStyles.navButtonInactive} hover:text-white`
      }`}
      aria-label={label}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const mainContent = () => {
    if (dreams.length === 0 && journalView !== 'achievements') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-white/70">
                <JournalIcon className="w-24 h-24 mb-4 opacity-50" />
                <h2 className="text-2xl font-bold text-white">Your Dream Journal is Empty</h2>
                <p className="mt-2">Start a chat with Echo to record and analyze your first dream!</p>
            </div>
        );
    }
    
    switch (journalView) {
        case 'list':
            return (
                <>
                    <div className={`flex justify-center items-center flex-wrap gap-2 mb-6 ${animationsEnabled ? 'animate-fade-in' : ''}`}>
                        <button
                            onClick={() => setActiveFilter('All')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${animationsEnabled ? 'active:scale-95' : ''} ${
                                activeFilter === 'All'
                                ? `${isNightMode ? themeStyles.navButtonActiveNight : themeStyles.navButtonActive} text-white shadow-md`
                                : isNightMode
                                ? 'bg-black/20 hover:bg-black/40 text-white/70'
                                : 'bg-black/10 hover:bg-black/20 text-white/70'
                            }`}
                        >
                            All Dreams
                        </button>
                        {MOOD_OPTIONS.map(({ mood, emoji }) => (
                            <button
                                key={mood}
                                onClick={() => setActiveFilter(mood)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${animationsEnabled ? 'active:scale-95' : ''} ${
                                    activeFilter === mood
                                    ? `${isNightMode ? themeStyles.navButtonActiveNight : themeStyles.navButtonActive} text-white shadow-md`
                                    : isNightMode
                                    ? 'bg-black/20 hover:bg-black/40 text-white/70'
                                    : 'bg-black/10 hover:bg-black/20 text-white/70'
                                }`}
                            >
                                <span className="text-base">{emoji}</span>
                                {mood}
                            </button>
                        ))}
                    </div>
    
                    {filteredDreams.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredDreams.map(dream => (
                            <DreamCard key={dream.id} dream={dream} isNightMode={isNightMode} onUpdate={onUpdateDream} onDelete={onDeleteDream} animationsEnabled={animationsEnabled} />
                            ))}
                        </div>
                    ) : (
                        <div className={`text-center py-12 text-white/70 ${animationsEnabled ? 'animate-fade-in' : ''}`}>
                            <p>No dreams found for this mood.</p>
                            <button onClick={() => setActiveFilter('All')} className="mt-2 text-sm text-pink-400 hover:underline">
                                Show all dreams
                            </button>
                        </div>
                    )}
                </>
            );
        case 'trends':
            return <MoodChart moodData={moodFrequencies} isNightMode={isNightMode} animationsEnabled={animationsEnabled} />;
        case 'cloud':
            return <DreamCloud dreams={dreams} isNightMode={isNightMode} animationsEnabled={animationsEnabled} />;
        case 'calendar':
            return <MoodCalendar dreams={dreams} isNightMode={isNightMode} animationsEnabled={animationsEnabled} />;
        case 'achievements':
            return <AchievementsGrid unlockedIds={unlockedAchievementIds} isNightMode={isNightMode} animationsEnabled={animationsEnabled} />;
        default:
            return null;
    }
  };


  return (
    <div className="space-y-4">
       <h2 className={`text-3xl font-bold text-center text-transparent bg-clip-text ${themeStyles.headerText}`}>My Dream Journal</h2>
        {streak > 0 && journalView === 'list' && (
            <div className={`flex justify-center items-center gap-2 mt-2 mb-6 text-lg ${themeStyles.streakText} ${animationsEnabled ? 'animate-fade-in' : ''}`}>
                <FireIcon className="w-6 h-6" />
                <span className="font-bold">{streak} Day Dream Streak!</span>
            </div>
        )}

        <div className={`p-4 rounded-xl mb-6 transition-colors duration-300 ${isNightMode ? 'bg-black/30' : 'bg-black/20'} border ${isNightMode ? themeStyles.containerBorderNight : themeStyles.containerBorderDay}`}>
            <h3 className="text-lg font-bold text-white mb-3 text-center flex items-center justify-center gap-2">
                <SparklesIcon className="w-5 h-5 text-yellow-300"/>
                Quick Symbol Lookup
            </h3>
            <div className="flex items-center gap-2">
                <input 
                    type="text" 
                    value={symbolQuery}
                    onChange={(e) => setSymbolQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSymbolLookup()}
                    placeholder="e.g., 'flying', 'water', 'teeth'"
                    className={`flex-grow w-full p-2 rounded-lg text-sm focus:ring-2 focus:outline-none transition placeholder:text-white/60 duration-300 text-white ${isNightMode ? 'bg-slate-800 focus:ring-pink-500' : 'bg-slate-700 focus:ring-pink-500'}`}
                />
                <button 
                    onClick={handleSymbolLookup} 
                    disabled={isSymbolLoading || !symbolQuery.trim()} 
                    className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all ${isNightMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-pink-600 hover:bg-pink-700'} disabled:bg-slate-600 disabled:cursor-not-allowed ${animationsEnabled ? 'active:scale-95' : ''}`}
                >
                    {isSymbolLoading ? <LoadingIcon className="w-5 h-5" /> : 'Go'}
                </button>
            </div>
             {(isSymbolLoading || symbolMeaning || symbolError) && (
                <div className={`mt-3 p-3 rounded-lg text-sm transition-opacity duration-300 ${isNightMode ? 'bg-slate-800/80' : 'bg-slate-900/50'}`}>
                    {isSymbolLoading && <p className="text-center text-sm text-purple-300">Echo is pondering...</p>}
                    {symbolError && !isSymbolLoading && <p className="text-red-400">{symbolError}</p>}
                    {symbolMeaning && !isSymbolLoading && <p className="text-white/90">{symbolMeaning}</p>}
                </div>
            )}
        </div>
        
        <div className={`flex justify-center mb-6 ${animationsEnabled ? 'animate-fade-in' : ''}`}>
            <div className={`flex items-center flex-wrap justify-center gap-1 p-1 rounded-full transition-colors duration-500 ${isNightMode ? 'bg-black/30' : 'bg-black/20'}`}>
                <ViewToggleButton label="List" isActive={journalView === 'list'} onClick={() => setJournalView('list')}>
                    <JournalIcon className="w-5 h-5" />
                </ViewToggleButton>
                 <ViewToggleButton label="Cloud" isActive={journalView === 'cloud'} onClick={() => setJournalView('cloud')}>
                    <CloudIcon className="w-5 h-5" />
                </ViewToggleButton>
                 <ViewToggleButton label="Calendar" isActive={journalView === 'calendar'} onClick={() => setJournalView('calendar')}>
                    <CalendarDaysIcon className="w-5 h-5" />
                </ViewToggleButton>
                <ViewToggleButton label="Trends" isActive={journalView === 'trends'} onClick={() => setJournalView('trends')}>
                    <ChartBarIcon className="w-5 h-5" />
                </ViewToggleButton>
                <ViewToggleButton label="Achievements" isActive={journalView === 'achievements'} onClick={() => setJournalView('achievements')}>
                    <TrophyIcon className="w-5 h-5" />
                </ViewToggleButton>
            </div>
        </div>
        
        <div key={journalView} className={`${animationsEnabled ? 'animate-fade-in' : ''}`}>
            {mainContent()}
        </div>

      {animationsEnabled && <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>}
    </div>
  );
};
