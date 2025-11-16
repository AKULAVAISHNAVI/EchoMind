import React from 'react';
import { AchievementId } from '../types';
import { ACHIEVEMENTS_LIST } from '../constants';

interface AchievementCardProps {
    isUnlocked: boolean;
    achievement: typeof ACHIEVEMENTS_LIST[0];
    isNightMode: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ isUnlocked, achievement, isNightMode }) => {
    const Icon = achievement.icon;
    const bgColor = isNightMode ? 'bg-slate-800' : 'bg-slate-700';
    const unlockedBgColor = isNightMode ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-purple-500 to-pink-500';
    const textColor = isUnlocked ? 'text-white' : 'text-slate-400';
    const iconColor = isUnlocked ? 'text-yellow-300' : 'text-slate-500';

    return (
        <div className={`p-4 rounded-xl flex flex-col items-center justify-start text-center transition-all duration-300 ${isUnlocked ? `${unlockedBgColor} shadow-lg` : bgColor}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors duration-300 ${isUnlocked ? 'bg-white/10' : 'bg-slate-600/50'}`}>
                <Icon className={`w-8 h-8 transition-colors duration-300 ${iconColor}`} />
            </div>
            <h4 className={`font-bold text-md ${textColor}`}>{achievement.name}</h4>
            <p className={`text-xs mt-1 ${isUnlocked ? 'text-purple-200' : 'text-slate-500'}`}>{achievement.description}</p>
        </div>
    );
};


interface AchievementsGridProps {
    unlockedIds: Set<AchievementId>;
    isNightMode: boolean;
    // FIX: Add animationsEnabled to conditionally apply animations
    animationsEnabled: boolean;
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({ unlockedIds, isNightMode, animationsEnabled }) => {
    return (
        <div className={`${animationsEnabled ? 'animate-fade-in' : ''}`}>
            <h3 className="text-xl font-bold text-center text-white mb-6">Your Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ACHIEVEMENTS_LIST.map(achievement => (
                    <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={unlockedIds.has(achievement.id)}
                        isNightMode={isNightMode}
                    />
                ))}
            </div>
        </div>
    );
};