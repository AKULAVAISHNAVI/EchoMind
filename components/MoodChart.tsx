import React, { useState, useEffect } from 'react';
import { Mood } from '../types';
import { ChartBarIcon } from './Icons';

interface MoodChartProps {
    isNightMode: boolean;
    moodData: { 
        mood: Mood; 
        count: number; 
        emoji: string; 
        color: string;
        colorNight: string;
    }[];
    // FIX: Add animationsEnabled to conditionally apply animations
    animationsEnabled: boolean;
}

const MoodChartBar: React.FC<{
    emoji: string;
    label: string;
    value: number;
    percentage: number;
    color: string;
    animationsEnabled: boolean;
}> = ({ emoji, label, value, percentage, color, animationsEnabled }) => {
    const [barWidth, setBarWidth] = useState(0);

    useEffect(() => {
        if (animationsEnabled) {
            // Timeout to allow the component to mount before starting the animation
            const timer = setTimeout(() => setBarWidth(percentage), 100);
            return () => clearTimeout(timer);
        } else {
            setBarWidth(percentage);
        }
    }, [percentage, animationsEnabled]);
    
    return (
        <div className="flex items-center gap-3 w-full">
            <div className="flex items-center gap-2 w-24 flex-shrink-0 text-sm font-medium text-slate-200">
                <span className="text-xl">{emoji}</span>
                <span className="truncate">{label}</span>
            </div>
            <div className="flex-1 flex items-center gap-2">
                <div className="w-full bg-slate-700/50 rounded-full h-6 overflow-hidden">
                    <div
                        className={`${color} h-6 rounded-full flex items-center justify-end pr-2 text-white font-bold text-xs ${animationsEnabled ? 'transition-all duration-1000 ease-out' : ''}`}
                        style={{ width: `${barWidth}%` }}
                    >
                    </div>
                </div>
                 <span className="font-bold text-lg text-white w-8 text-left">{value}</span>
            </div>
        </div>
    );
};


export const MoodChart: React.FC<MoodChartProps> = ({ moodData, isNightMode, animationsEnabled }) => {
    if (moodData.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center h-full text-center text-purple-300 py-12 ${animationsEnabled ? 'animate-fade-in' : ''}`}>
                <ChartBarIcon className="w-24 h-24 mb-4 text-purple-400/50" />
                <h2 className="text-2xl font-bold text-white">No Mood Data Yet</h2>
                <p className="mt-2">Analyze some dreams and assign moods to see your trends here!</p>
            </div>
        );
    }
    
    const maxCount = Math.max(...moodData.map(d => d.count), 0);

    return (
        <div className={`p-4 sm:p-6 rounded-xl transition-colors duration-300 ${isNightMode ? 'bg-slate-900/70' : 'bg-slate-800/70'} ${animationsEnabled ? 'animate-fade-in' : ''}`}>
            <h3 className="text-xl font-bold text-center text-white mb-6">Your Dream Mood Frequencies</h3>
            <div className="space-y-4">
                {moodData.map(({ mood, emoji, count, color, colorNight }) => (
                    <MoodChartBar
                        key={mood}
                        emoji={emoji}
                        label={mood}
                        value={count}
                        percentage={maxCount > 0 ? (count / maxCount) * 100 : 0}
                        color={isNightMode ? colorNight.split(' ')[0] : color.split(' ')[0]}
                        animationsEnabled={animationsEnabled}
                    />
                ))}
            </div>
        </div>
    );
};