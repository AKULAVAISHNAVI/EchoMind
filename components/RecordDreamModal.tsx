
import React, { useState, useEffect, useRef } from 'react';
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

type Status = 'idle' | 'recording' | 'processing' | 'finished';

export const RecordDreamModal: React.FC<RecordDreamModalProps> = ({ isOpen, onClose, onSend, isNightMode }) => {
  const [editableTranscript, setEditableTranscript] = useState('');
  const [detectedVoiceMood, setDetectedVoiceMood] = useState<Mood | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const { realtimeMood, startEmotionAnalysis, stopEmotionAnalysis } = useVoiceEmotion();
  
  // Ref to track if the component is mounted or if processing was cancelled
  const isProcessingRef = useRef(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => {
            setEditableTranscript('');
            setDetectedVoiceMood(null);
            setStatus('idle');
            isProcessingRef.current = false;
        }, 300); // Wait for closing animation
    } else {
        setStatus('idle');
        isProcessingRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMicClick = async () => {
    if (isRecording) {
      setStatus('processing');
      isProcessingRef.current = true;

      const audioBlob = await stopRecording();
      const mood = await stopEmotionAnalysis();
      setDetectedVoiceMood(mood);
      
      if (audioBlob) {
        try {
          const transcript = await transcribeAudio(audioBlob);
          // Only update if we are still processing (user hasn't cancelled)
          if (isProcessingRef.current) {
             setEditableTranscript(transcript);
             setStatus('finished');
          }
        } catch (error) {
            console.error(error);
            if (isProcessingRef.current) {
                setEditableTranscript("Sorry, I couldn't transcribe that. Please try again or type your dream manually.");
                setStatus('finished');
            }
        } finally {
            isProcessingRef.current = false;
        }
      } else {
        setStatus('idle'); // No audio recorded
      }

    } else {
      setEditableTranscript('');
      setDetectedVoiceMood(null);
      setStatus('recording');
      startRecording();
      startEmotionAnalysis();
    }
  };
  
  const handleCancelProcessing = () => {
      isProcessingRef.current = false;
      setStatus('finished');
      setEditableTranscript(''); // Allow user to type manually
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
    isProcessingRef.current = false;
    onClose();
  }
  
  const detectedMoodStyles = detectedVoiceMood ? MOOD_OPTIONS.find(m => m.mood === detectedVoiceMood) : null;
  const realtimeMoodStyles = realtimeMood ? MOOD_OPTIONS.find(m => m.mood === realtimeMood) : null;

  const getMicButtonClasses = () => {
    const baseClasses = 'relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 disabled:bg-slate-500';

    if (status === 'recording') {
        if (realtimeMoodStyles) {
            const color = isNightMode ? realtimeMoodStyles.colorNight.split(' ')[0] : realtimeMoodStyles.color.split(' ')[0];
            return `${baseClasses} ${color} animate-pulse-gentle`;
        }
        return `${baseClasses} bg-red-500 shadow-red-500/50 animate-pulse-deep`;
    }
    return `${baseClasses} bg-purple-600 shadow-purple-500/50`;
  };

  const statusText: Record<Status, string> = {
    idle: 'Tap to start recording',
    recording: realtimeMood ? `Sensing: ${realtimeMood}` : 'Listening...',
    processing: 'Processing your voice...',
    finished: 'Tap to re-record'
  }

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
          <h2 className="text-2xl font-bold text-white">Record Your Message</h2>
          <button onClick={handleClose} className="p-1 rounded-full text-purple-300 hover:bg-slate-700 transition">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-grow">
            <div className="w-48 h-48 rounded-full flex items-center justify-center">
                <button 
                    onClick={handleMicClick}
                    disabled={status === 'processing'}
                    className={getMicButtonClasses()}
                >
                   {status === 'recording' && realtimeMoodStyles ? (
                        <span className="text-6xl animate-emoji-pop-in">{realtimeMoodStyles.emoji}</span>
                    ) : (
                        <>
                            <MicIcon className="w-16 h-16 text-white"/>
                            {status === 'recording' && <WaveformIcon className="absolute inset-0 w-full h-full text-white/50 animate-spin-slow" />}
                        </>
                    )}
                </button>
            </div>
            <p className="mt-4 font-semibold text-purple-200 h-6">
                {statusText[status]}
            </p>
        </div>

        { (status === 'finished' || editableTranscript || status === 'processing') && (
            <div className="mt-6 space-y-4 animate-fade-in relative">
                {status === 'processing' && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 rounded-lg text-center p-4">
                    <LoadingIcon className="w-8 h-8 text-white mb-2" />
                    <p className="text-white/90 font-medium">Echo is processing your voice...</p>
                    <button 
                        onClick={handleCancelProcessing}
                        className="mt-3 text-sm text-red-300 hover:text-red-200 underline font-medium"
                    >
                        Taking too long? Cancel & Type
                    </button>
                  </div>
                )}

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
                    <label htmlFor="transcript" className="font-semibold text-sm text-purple-300 mb-1 block mt-4">Your transcript (edit if needed):</label>
                    <div className="relative">
                        <textarea
                            id="transcript"
                            value={editableTranscript}
                            onChange={(e) => setEditableTranscript(e.target.value)}
                            placeholder="Your transcribed text will appear here..."
                            className={`w-full p-3 rounded-xl resize-y focus:ring-2 focus:ring-purple-500 focus:outline-none transition placeholder:text-slate-400 duration-300 ${isNightMode ? 'bg-slate-800/80' : 'bg-slate-700/80'}`}
                            rows={4}
                            disabled={status === 'processing'}
                        />
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
            disabled={!editableTranscript.trim() || status === 'processing'}
            className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition shadow-lg disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
            Send <PaperPlaneIcon className="w-4 h-4" />
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
        @keyframes emoji-pop-in {
            0% { transform: scale(0.5); opacity: 0; }
            70% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-emoji-pop-in {
            animation: emoji-pop-in 0.4s ease-out;
        }
        @keyframes pulse-gentle {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.03);
            }
        }
        .animate-pulse-gentle {
            animation: pulse-gentle 2.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
