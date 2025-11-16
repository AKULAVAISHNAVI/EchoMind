import React, { useMemo } from 'react';
import { Dream } from '../types';
import { STOP_WORDS } from '../constants';
import { CloudIcon } from './Icons';

interface DreamCloudProps {
  dreams: Dream[];
  isNightMode: boolean;
  // FIX: Add animationsEnabled to conditionally apply animations
  animationsEnabled: boolean;
}

interface Word {
  text: string;
  value: number;
}

const processWords = (dreams: Dream[]): Word[] => {
    const allText = dreams.map(d => `${d.dream} ${d.analysis}`).join(' ');
    
    // Regex to match words, excluding numbers
    const words = allText.toLowerCase().match(/\b([a-zA-Z]+)\b/g) || [];

    const wordCounts: Record<string, number> = {};

    for (const word of words) {
        if (!STOP_WORDS.has(word) && word.length > 2) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
    }

    const sortedWords = Object.entries(wordCounts)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value);

    return sortedWords.slice(0, 50); // Take top 50 words
};

export const DreamCloud: React.FC<DreamCloudProps> = ({ dreams, isNightMode, animationsEnabled }) => {
    const wordData = useMemo(() => processWords(dreams), [dreams]);
    
    if (wordData.length < 5) {
        return (
            <div className={`flex flex-col items-center justify-center h-full text-center text-purple-300 py-12 ${animationsEnabled ? 'animate-fade-in' : ''}`}>
                <CloudIcon className="w-24 h-24 mb-4 text-purple-400/50" />
                <h2 className="text-2xl font-bold text-white">Your Dream Cloud is Gathering...</h2>
                <p className="mt-2">Record a few more dreams to see your personal dream themes appear here!</p>
            </div>
        );
    }
    
    const maxFreq = wordData[0].value;
    const minFreq = wordData[wordData.length - 1].value;

    const getFontSize = (freq: number) => {
        if (maxFreq === minFreq) return '1rem'; // Handle case where all words have same frequency
        const size = 0.8 + 2.5 * ((freq - minFreq) / (maxFreq - minFreq));
        return `${size}rem`;
    };
    
    const colors = isNightMode 
        ? ['text-purple-300', 'text-pink-300', 'text-cyan-300', 'text-green-300', 'text-yellow-300']
        : ['text-purple-400', 'text-pink-400', 'text-cyan-400', 'text-green-400', 'text-yellow-400'];

    return (
        <div className={`p-4 sm:p-6 rounded-xl transition-colors duration-300 ${isNightMode ? 'bg-slate-900/70' : 'bg-slate-800/70'} ${animationsEnabled ? 'animate-fade-in' : ''}`}>
            <h3 className="text-xl font-bold text-center text-white mb-6">Your Recurring Dream Themes</h3>
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
                {wordData.map((word, index) => (
                    <span
                        key={word.text}
                        className={`font-bold transition-all duration-300 ${colors[index % colors.length]}`}
                        style={{
                            fontSize: getFontSize(word.value),
                            lineHeight: 1.2,
                        }}
                    >
                        {word.text}
                    </span>
                ))}
            </div>
        </div>
    );
};