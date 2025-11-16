import React, { useState, useMemo } from 'react';
import { Dream, Mood } from '../types';
import { MOOD_OPTIONS } from '../constants';
import { CalendarDaysIcon } from './Icons';

interface MoodCalendarProps {
  dreams: Dream[];
  isNightMode: boolean;
  animationsEnabled: boolean;
}

const DaySquare: React.FC<{ day: { date: string; mood?: Mood; color?: string; count: number }; isNightMode: boolean }> = ({ day, isNightMode }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const bgColor = day.mood ? day.color : (isNightMode ? 'bg-slate-800' : 'bg-slate-700/50');
    
    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`w-full h-full rounded-sm transition-transform transform hover:scale-125 z-10 ${bgColor}`}
                style={{ aspectRatio: '1 / 1' }}
            ></div>
            {isHovered && day.mood && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-slate-900 rounded-md shadow-lg whitespace-nowrap z-20 pointer-events-none">
                    <strong>{day.date}</strong>: {day.mood}
                </div>
            )}
        </div>
    );
};

export const MoodCalendar: React.FC<MoodCalendarProps> = ({ dreams, isNightMode, animationsEnabled }) => {
    const moodDataByDate = useMemo(() => {
        const data: { [key: string]: { mood: Mood; color: string } } = {};
        dreams.forEach(dream => {
            if (dream.mood) {
                const dateKey = new Date(dream.date).toISOString().split('T')[0];
                const moodOption = MOOD_OPTIONS.find(m => m.mood === dream.mood);
                if (moodOption) {
                    data[dateKey] = { mood: dream.mood, color: moodOption.calendarColor };
                }
            }
        });
        return data;
    }, [dreams]);

    const calendarData = useMemo(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 119); // Approx 4 months (17 weeks)
        
        const months = [];
        let currentDate = new Date(startDate);
        currentDate.setDate(1); // Start from the first day of the start month
        
        for (let i = 0; i < 4; i++) {
            const monthName = currentDate.toLocaleString('default', { month: 'short' });
            const year = currentDate.getFullYear();
            const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
            const firstDayOfWeek = new Date(year, currentDate.getMonth(), 1).getDay();

            const month = {
                name: monthName,
                year: year,
                days: [],
                leadingEmptyDays: Array(firstDayOfWeek).fill(null)
            };
            
            for (let day = 1; day <= daysInMonth; day++) {
                const dayDate = new Date(year, currentDate.getMonth(), day);
                const dateKey = dayDate.toISOString().split('T')[0];
                const data = moodDataByDate[dateKey];
                month.days.push({
                    date: dayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    mood: data?.mood,
                    color: data?.color,
                    count: data ? 1 : 0,
                });
            }
            months.push(month);
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        return months;

    }, [moodDataByDate]);

    if (Object.keys(moodDataByDate).length === 0) {
       return (
            <div className={`flex flex-col items-center justify-center h-full text-center text-purple-300 py-12 ${animationsEnabled ? 'animate-fade-in' : ''}`}>
                <CalendarDaysIcon className="w-24 h-24 mb-4 text-purple-400/50" />
                <h2 className="text-2xl font-bold text-white">Your Mood Calendar is Empty</h2>
                <p className="mt-2">Log some dreams with moods to see your emotional patterns here!</p>
            </div>
        );
    }

    return (
        <div className={`p-4 sm:p-6 rounded-xl transition-colors duration-300 ${isNightMode ? 'bg-slate-900/70' : 'bg-slate-800/70'}`}>
             <h3 className="text-xl font-bold text-center text-white mb-6">Your Dream Mood Calendar</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {calendarData.map(month => (
                    <div key={`${month.name}-${month.year}`}>
                        <h4 className="font-bold text-white mb-2">{month.name} {month.year}</h4>
                        <div className="grid grid-cols-7 gap-1">
                             {/* Render leading empty squares for alignment */}
                            {month.leadingEmptyDays.map((_, index) => <div key={`empty-${index}`}></div>)}
                            {month.days.map((day, index) => (
                                <DaySquare key={index} day={day} isNightMode={isNightMode} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center items-center gap-4 mt-6 text-xs text-slate-400">
                <span className="font-bold">Legend:</span>
                {MOOD_OPTIONS.map(mood => (
                    <div key={mood.mood} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm ${mood.calendarColor}`}></div>
                        <span>{mood.mood}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
