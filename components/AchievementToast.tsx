import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';
import { TrophyIcon } from './Icons';

interface AchievementToastProps {
    achievement: Achievement | null;
    onDismiss: () => void;
    // FIX: Add animationsEnabled prop to fix TypeScript error in App.tsx
    animationsEnabled: boolean;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss, animationsEnabled }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (achievement) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                // Allow time for fade-out animation before calling onDismiss
                setTimeout(onDismiss, 500);
            }, 5000); // Show toast for 5 seconds

            return () => clearTimeout(timer);
        }
    }, [achievement, onDismiss]);

    if (!achievement) return null;

    return (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
            <div className="flex items-center gap-4 p-4 rounded-xl shadow-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white border border-white/20">
                <TrophyIcon className={`w-10 h-10 flex-shrink-0 text-white ${animationsEnabled ? 'animate-bounce' : ''}`} />
                <div>
                    <h4 className="font-bold text-sm">Achievement Unlocked!</h4>
                    <p className="text-lg font-semibold">{achievement.name}</p>
                </div>
                <button onClick={() => setIsVisible(false)} className="ml-4 p-1 rounded-full hover:bg-white/20">
                   &times;
                </button>
            </div>
            {animationsEnabled && <style>{`
                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(-10%);
                        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
                    }
                    50% {
                        transform: translateY(0);
                        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
                    }
                }
                .animate-bounce {
                    animation: bounce 1s infinite;
                }
            `}</style>}
        </div>
    );
};