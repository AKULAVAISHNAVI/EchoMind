import React, { useState, useEffect } from 'react';
import { Mood } from '../types';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useVoiceEmotion } from '../hooks/useVoiceEmotion';
import { MicIcon, PaperPlaneIcon, SoundWaveIcon, WaveformIcon, XIcon, LoadingIcon } from './Icons';
import { MOOD_OPTIONS } from '../constants';
import { transcribeAudio } from '../services/geminiService';

interface RecordDreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (dreamText: string, detectedMood: Mood | null) => void;
  isNightMode: boolean;
}

export const RecordDreamModal: React.FC<RecordDreamModalProps> = ({ isOpen, onClose, onSend, isNightMode }) => {
  const [editableTranscript, setEditableTranscript] = useState('');
  const [detectedVoiceMood, setDetectedVoiceMood] = useState<Mood | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const { isAnalyzing, realtimeMood, startEmotionAnalysis, stopEmotionAnalysis } = useVoiceEmotion();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => {
            setEditableTranscript('');
            setDetectedVoiceMood(null);
            setHasRecorded(false);
            setIsTranscribing(false);
        }, 300); // Wait for closing animation
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMicClick = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      const mood = await stopEmotionAnalysis();
      setDetectedVoiceMood(mood);
      setHasRecorded(true);

      if (audioBlob) {
        setIsTranscribing(true);
        try {
          const transcript = await transcribeAudio(audioBlob);
          setEditableTranscript(transcript);
        } catch (error) {
            console.error(error);
            setEditableTranscript("Sorry, I couldn't transcribe that. Please try again or type your dream manually.");
        } finally {
            setIsTranscribing(false);
        }
      }

    } else {
      setEditableTranscript('');
      setDetectedVoiceMood(null);
      setHasRecorded(false);
      startRecording();
      startEmotionAnalysis();
    }
  };
  
  const handleSend = () => {
    if (editableTranscript.trim()) {
        onSend(editableTranscript.trim(), detectedVoiceMood);
    }
  }

  const handleClose = () => {
    if (isRecording) {
        stopRecording();
        stopEmotionAnalysis();
    }
    onClose();
  }
  
  const detectedMoodStyles = detectedVoiceMood ? MOOD_OPTIONS.find(m => m.mood === detectedVoiceMood) : null;
  const realtimeMoodStyles = realtimeMood ? MOOD_OPTIONS.find(m => m.mood === realtimeMood) : null;

  const micButtonBgColor = isRecording ? 'bg-red-500 shadow-red-500/50 animate-pulse-deep' : 'bg-purple-600 shadow-purple-500/50';


  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-fast"
        onClick={handleClose}
    >
      <div 
        className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl border flex flex-col transition-colors duration-500 ${isNightMode ? 'bg-slate-900 border-purple-800/40' : 'bg-slate-800 border-purple-500/20'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Record Your Dream</h2>
          <button onClick={handleClose} className="p-1 rounded-full text-purple-300 hover:bg-slate-700 transition">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-grow">
            <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording && realtimeMoodStyles ? (isNightMode ? realtimeMoodStyles.colorNight.replace('hover:', '') : realtimeMoodStyles.color.replace('hover:', '')) : 'bg-transparent'}`}>
                <button 
                    onClick={handleMicClick}
                    disabled={isTranscribing}
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 disabled:bg-slate-500 ${micButtonBgColor}`}
                >
                    <MicIcon className="w-16 h-16 text-white"/>
                    {isRecording && !realtimeMood && <WaveformIcon className="absolute inset-0 w-full h-full text-white/50 animate-spin-slow" />}
                    {isRecording && realtimeMoodStyles && (
                        <span className="absolute text-5xl transition-transform duration-300 transform scale-125">{realtimeMoodStyles.emoji}</span>
                    )}
                </button>
            </div>
            <p className="mt-4 font-semibold text-purple-200 h-6">
                {isRecording ? (realtimeMood ? `Sensing: ${realtimeMood}`: 'Listening...') : isTranscribing ? 'Transcribing...' : (hasRecorded ? 'Tap to re-record' : 'Tap to start recording')}
            </p>
        </div>

        { (hasRecorded || editableTranscript || isTranscribing) && (
            <div className="mt-6 space-y-4 animate-fade-in">
                 {detectedMoodStyles && (
                    <div className="flex flex-col items-center">
                        <h4 className="font-semibold text-sm text-purple-300 mb-2 flex items-center gap-1.5">
                            <SoundWaveIcon className="w-4 h-4" />
                            Echo Detected This Emotion in Your Voice
                        </h4>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold text-sm ${isNightMode ? detectedMoodStyles.colorNight : detectedMoodStyles.color}`}>
                           <span className="text-xl">{detectedMoodStyles.emoji}</span>
                           <span>{detectedMoodStyles.mood}</span>
                        </div>
                    </div>
                )}
                <div>
                    <label htmlFor="transcript" className="font-semibold text-sm text-purple-300 mb-1 block mt-4">Your dream transcript (edit if needed):</label>
                    <div className="relative">
                        <textarea
                            id="transcript"
                            value={editableTranscript}
                            onChange={(e) => setEditableTranscript(e.target.value)}
                            placeholder="Your transcribed dream will appear here..."
                            className={`w-full p-3 rounded-xl resize-y focus:ring-2 focus:ring-purple-500 focus:outline-none transition placeholder:text-slate-400 duration-300 ${isNightMode ? 'bg-slate-800/80' : 'bg-slate-700/80'}`}
                            rows={4}
                            disabled={isTranscribing}
                        />
                         {isTranscribing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-xl">
                                <LoadingIcon className="w-6 h-6 text-white" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <button 
            onClick={handleClose} 
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isNightMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-600 hover:bg-slate-500'}`}
            >
            Cancel
          </button>
          <button 
            onClick={handleSend}
            disabled={!editableTranscript.trim() || isTranscribing || isRecording}
            className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition shadow-lg disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
            Send Dream <PaperPlaneIcon className="w-4 h-4" />
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
         @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        @keyframes pulse-deep {
            0%, 100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 0 0 10px 15px rgba(239, 68, 68, 0);
            }
        }
        .animate-pulse-deep {
            animation: pulse-deep 2s infinite;
        }
      `}</style>
    </div>
  );
};