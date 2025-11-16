import React, { useState } from 'react';
import { Dream, Mood } from '../types';
import { ChevronDownIcon, ChevronUpIcon, PencilIcon, TrashIcon, CheckIcon, XIcon, SoundWaveIcon, ShareIcon, ImageIcon, LoadingIcon } from './Icons';
import { MOOD_OPTIONS } from '../constants';
import { generateDreamImage } from '../services/geminiService';

interface DreamCardProps {
  dream: Dream;
  isNightMode: boolean;
  onUpdate: (dream: Dream) => void;
  onDelete: (id: string) => void;
  animationsEnabled: boolean;
}

const moodToEmoji: Record<string, string> = {
  [Mood.Happy]: '😊',
  [Mood.Sad]: '😢',
  [Mood.Anxious]: '😟',
  [Mood.Excited]: '🎉',
  [Mood.Neutral]: '🤔',
};

export const DreamCard: React.FC<DreamCardProps> = ({ dream, isNightMode, onUpdate, onDelete, animationsEnabled }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(dream);
  const [shareConfirmation, setShareConfirmation] = useState('');
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [visualizationError, setVisualizationError] = useState<string | null>(null);

  const formattedDate = new Date(dream.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const moodStyles = dream.mood ? MOOD_OPTIONS.find(m => m.mood === dream.mood) : null;
  const detectedMoodStyles = dream.detectedEmotion ? MOOD_OPTIONS.find(m => m.mood === dream.detectedEmotion) : null;

  const borderColorClass = isNightMode 
    ? moodStyles?.borderColorNight ?? 'border-purple-800/40'
    : moodStyles?.borderColor ?? 'border-purple-500/20';
  
  const moodColorClass = isNightMode
    ? moodStyles?.colorNight.split(' ')[0]
    : moodStyles?.color.split(' ')[0];


  const handleEdit = () => {
    setEditedData(dream);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    onUpdate(editedData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this dream? This action cannot be undone.')) {
        onDelete(dream.id);
    }
  };
  
  const handleShare = async () => {
    const shareText = `I had a dream on ${formattedDate}! 🌙\n\n*The Dream:*\n${dream.dream}\n\n*How I Felt:*\n"${dream.emotion}"\n\n*Echo's Thoughts: ✨*\n${dream.analysis}\n\nShared from EchoMind, my personal dream buddy!`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: `A Dream from ${formattedDate}`,
                text: shareText,
            });
        } catch (error) {
            console.error('Error sharing dream:', error);
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareText);
            setShareConfirmation('Copied!');
            setTimeout(() => setShareConfirmation(''), 2000);
        } catch (error) {
            console.error('Failed to copy dream to clipboard:', error);
            setShareConfirmation('Failed!');
            setTimeout(() => setShareConfirmation(''), 2000);
        }
    }
  };

  const handleVisualize = async () => {
    setIsVisualizing(true);
    setVisualizationError(null);
    try {
      const imageUrl = await generateDreamImage(dream.dream);
      onUpdate({ ...dream, imageUrl });
    } catch (error) {
      console.error(error);
      setVisualizationError("Couldn't visualize dream. Please try again.");
    } finally {
      setIsVisualizing(false);
    }
  };

  // Define styles for editing mode here for cleaner JSX
  const labelClasses = `block font-semibold text-sm mb-1 ${isNightMode ? 'text-purple-300' : 'text-white/80'}`;
  const inputBaseClasses = `w-full p-2 rounded-lg text-sm text-white transition duration-200 focus:outline-none focus:ring-2`;
  const inputColorClasses = isNightMode ? 'bg-slate-800 border border-slate-700 focus:ring-pink-500' : 'bg-slate-700/50 border border-slate-600/80 focus:ring-purple-500';
  const finalInputClasses = `${inputBaseClasses} ${inputColorClasses}`;

  return (
    <div className={`p-4 rounded-xl shadow-lg transition-all duration-300 ${isNightMode ? 'bg-black/30' : 'bg-black/20'} border ${borderColorClass}`}>
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex items-center gap-2 text-xs text-white/70">
            {dream.mood && moodColorClass && (
              <>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${moodColorClass}`}></div>
                  <span className="font-medium text-white">{dream.mood}</span>
                </div>
                <span>&bull;</span>
              </>
            )}
            <p>{formattedDate}</p>
          </div>
          <h3 className="font-bold text-lg text-white mt-1.5 line-clamp-2">
            {isEditing ? 'Editing Dream...' : dream.dream.split('\n')[0]}
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1 ml-2 flex-shrink-0 rounded-full transition-all ${isNightMode ? 'hover:bg-white/10' : 'hover:bg-black/10'} ${animationsEnabled ? 'active:scale-95' : ''}`}
          aria-label={isExpanded ? 'Collapse dream' : 'Expand dream'}
        >
          {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className={`mt-4 space-y-4 ${animationsEnabled ? 'animate-fade-in' : ''}`}>
          {isEditing ? (
            <div className="space-y-4">
              {dream.detectedEmotion && detectedMoodStyles && (
                <div>
                  <h4 className={labelClasses}>Detected Voice Emotion (Read-only)</h4>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white font-bold text-xs ${isNightMode ? detectedMoodStyles.colorNight : detectedMoodStyles.color}`}>
                    <span className="text-lg">{detectedMoodStyles.emoji}</span>
                    <span>{detectedMoodStyles.mood}</span>
                  </div>
                </div>
              )}
              <div>
                <label htmlFor={`dream-edit-${dream.id}`} className={labelClasses}>The Dream</label>
                <textarea id={`dream-edit-${dream.id}`} value={editedData.dream} onChange={(e) => setEditedData({ ...editedData, dream: e.target.value })} className={`${finalInputClasses} resize-y`} rows={4} />
              </div>
              <div>
                <label htmlFor={`emotion-edit-${dream.id}`} className={labelClasses}>How You Felt</label>
                <input id={`emotion-edit-${dream.id}`} type="text" value={editedData.emotion} onChange={(e) => setEditedData({ ...editedData, emotion: e.target.value })} className={`${finalInputClasses} italic`} />
              </div>
              <div>
                <label htmlFor={`mood-edit-${dream.id}`} className={labelClasses}>Overall Mood</label>
                <div className="relative">
                  <select id={`mood-edit-${dream.id}`} value={editedData.mood} onChange={(e) => setEditedData({ ...editedData, mood: e.target.value as Mood })} className={`${finalInputClasses} appearance-none pr-8`}>
                    {Object.values(Mood).map(mood => (
                      <option key={mood} value={mood} className="bg-slate-800 text-white">{moodToEmoji[mood]} {mood}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="w-5 h-5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />
                </div>
              </div>
              <div>
                <label htmlFor={`analysis-edit-${dream.id}`} className={labelClasses}>Echo's Thoughts ✨</label>
                <textarea id={`analysis-edit-${dream.id}`} value={editedData.analysis} onChange={(e) => setEditedData({ ...editedData, analysis: e.target.value })} className={`${finalInputClasses} resize-y`} rows={5} />
              </div>
            </div>
          ) : (
            <>
                {dream.imageUrl && (
                    <div className="relative">
                        <img src={dream.imageUrl} alt="A visualization of the dream" className="rounded-lg w-full aspect-square object-cover" />
                    </div>
                )}
                {isVisualizing && (
                    <div className="w-full aspect-square flex flex-col items-center justify-center bg-black/30 rounded-lg">
                        <LoadingIcon className="w-8 h-8 text-white" />
                        <p className="mt-2 text-sm text-white/80">Echo is painting your dream...</p>
                    </div>
                )}
                {visualizationError && (
                    <p className="text-xs text-center text-red-400">{visualizationError}</p>
                )}

                <div>
                    <h4 className={`font-semibold text-sm ${isNightMode ? 'text-purple-300' : 'text-white/80'}`}>The Dream</h4>
                    <p className="text-sm text-white mt-1 whitespace-pre-wrap">{dream.dream}</p>
                </div>
                <div>
                    <h4 className={`font-semibold text-sm ${isNightMode ? 'text-purple-300' : 'text-white/80'}`}>How You Felt</h4>
                    <p className="text-sm text-white mt-1 italic">"{dream.emotion}"</p>
                </div>
                {dream.mood && (
                    <div>
                    <h4 className={`font-semibold text-sm ${isNightMode ? 'text-purple-300' : 'text-white/80'}`}>Overall Mood</h4>
                    <p className="text-sm text-white mt-1">{moodToEmoji[dream.mood]} {dream.mood}</p>
                    </div>
                )}
                {detectedMoodStyles && (
                    <div>
                        <h4 className={`font-semibold text-sm flex items-center gap-1.5 mb-2 ${isNightMode ? 'text-purple-300' : 'text-white/80'}`}>
                            <SoundWaveIcon className="w-4 h-4" />
                            Detected Voice Emotion
                        </h4>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white font-bold text-xs ${isNightMode ? detectedMoodStyles.colorNight : detectedMoodStyles.color}`}>
                           <span className="text-lg">{detectedMoodStyles.emoji}</span>
                           <span>{detectedMoodStyles.mood}</span>
                        </div>
                    </div>
                )}
                <div>
                    <h4 className={`font-semibold text-sm ${isNightMode ? 'text-purple-300' : 'text-white/80'}`}>Echo's Thoughts ✨</h4>
                    <p className="text-sm text-white mt-1 whitespace-pre-wrap">{dream.analysis}</p>
                </div>
            </>
          )}

           <div className={`flex justify-end items-center gap-2 pt-2 border-t ${isNightMode ? 'border-white/10' : 'border-black/10'}`}>
                {isEditing ? (
                    <>
                        <button onClick={handleCancel} className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-gray-500 hover:bg-gray-600 rounded-full transition-all ${animationsEnabled ? 'active:scale-95' : ''}`}><XIcon className="w-4 h-4"/>Cancel</button>
                        <button onClick={handleSave} className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full transition-all ${animationsEnabled ? 'active:scale-95' : ''}`}><CheckIcon className="w-4 h-4"/>Save</button>
                    </>
                ) : (
                    <>
                        {!dream.imageUrl && !isVisualizing && (
                            <button 
                                onClick={handleVisualize} 
                                className={`p-2 rounded-full transition-all ${isNightMode ? 'text-purple-300 hover:text-white hover:bg-white/10' : 'text-white/70 hover:text-white hover:bg-black/10'} ${animationsEnabled ? 'active:scale-95' : ''}`}
                                aria-label="Visualize dream"
                            >
                                <ImageIcon className="w-4 h-4" />
                            </button>
                        )}
                         {isVisualizing && (
                            <div className="p-2">
                               <LoadingIcon className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <div className="relative">
                            <button 
                                onClick={handleShare} 
                                className={`p-2 rounded-full transition-all ${isNightMode ? 'text-purple-300 hover:text-white hover:bg-white/10' : 'text-white/70 hover:text-white hover:bg-black/10'} ${animationsEnabled ? 'active:scale-95' : ''}`}
                                aria-label="Share dream"
                            >
                                <ShareIcon className="w-4 h-4" />
                            </button>
                             {shareConfirmation && (
                                <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-slate-600 rounded-md shadow-lg ${animationsEnabled ? 'animate-fade-in-out' : ''}`}>
                                    {shareConfirmation}
                                </div>
                            )}
                        </div>
                        <button onClick={handleEdit} className={`p-2 rounded-full transition-all ${isNightMode ? 'text-purple-300 hover:text-white hover:bg-white/10' : 'text-white/70 hover:text-white hover:bg-black/10'} ${animationsEnabled ? 'active:scale-95' : ''}`} aria-label="Edit dream"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={handleDelete} className={`p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-full transition-all ${animationsEnabled ? 'active:scale-95' : ''}`} aria-label="Delete dream"><TrashIcon className="w-4 h-4" /></button>
                    </>
                )}
            </div>

        </div>
      )}
      {/* FIX: Corrected the syntax for the template literal inside the style tag. */}
      {animationsEnabled && <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(0) translateX(-50%); }
          10% { opacity: 1; transform: translateY(-5px) translateX(-50%); }
          90% { opacity: 1; transform: translateY(-5px) translateX(-50%); }
          100% { opacity: 0; transform: translateY(0) translateX(-50%); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out forwards;
        }
      `}</style>}
    </div>
  );
};
