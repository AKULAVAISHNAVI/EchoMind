import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Dream, CustomizationSettings, Achievement, AchievementId } from '../types';
import { ACHIEVEMENTS_LIST } from '../constants';

export const useAchievements = (
    onAchievementUnlock: (achievement: Achievement) => void
) => {
    const [unlockedIds, setUnlockedIds] = useLocalStorage<AchievementId[]>('echomind-unlocked-achievements', []);

    const unlockedAchievementIds = new Set(unlockedIds);

    const checkAndUnlockAchievements = useCallback((
        dreams: Dream[], 
        settings: CustomizationSettings
    ) => {
        const newlyUnlocked: Achievement[] = [];
        for (const achievement of ACHIEVEMENTS_LIST) {
            if (!unlockedAchievementIds.has(achievement.id)) {
                if (achievement.isUnlocked(dreams, settings)) {
                    newlyUnlocked.push(achievement);
                }
            }
        }

        if (newlyUnlocked.length > 0) {
            const newIds = newlyUnlocked.map(a => a.id);
            setUnlockedIds(prev => [...prev, ...newIds]);
            // Show toast for the first newly unlocked achievement
            onAchievementUnlock(newlyUnlocked[0]);
        }
    }, [unlockedAchievementIds, setUnlockedIds, onAchievementUnlock]);

    return { unlockedAchievementIds, checkAndUnlockAchievements };
};
