import React, { useState, useEffect } from 'react';
import { Mood } from '../types';
import { XIcon, LoadingIcon, AlertTriangleIcon, CloudUploadIcon, CheckCircleIcon, CircleIcon } from './Icons';
import { transcribeAudio } from '../services/geminiService';
import { analyzeAudioFileForEmotion } from '../services/voiceEmotionService';

interface CloudUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (dreamText: string, detectedMood: Mood | null) => void;
  isNightMode: boolean;
}

type StepStatus = 'pending' | 'loading' | 'done' | 'error';
interface ProgressStep {
    id: 'fetch' | 'analyze' | 'transcribe';
    label: string;
    status: StepStatus;
}

const initialSteps: ProgressStep[] = [
    { id: 'fetch', label: 'Fetching Audio File', status: 'pending' },
    { id: 'analyze', label: 'Analyzing Voice Emotion', status: 'pending' },
    { id: 'transcribe', label: 'Transcribing Dream', status: 'pending' },
];


export const CloudUrlModal: React.FC<CloudUrlModalProps> = ({ isOpen, onClose, onSend, isNightMode }) => {
  const [url, setUrl] = useState('');
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>(initialSteps);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => {
            setUrl('');
            setProgressSteps(initialSteps);
            setErrorMessage('');
            setIsProcessing(false);
        }, 300); // Wait for closing animation
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateStepStatus = (id: ProgressStep['id'], status: StepStatus, newLabel?: string) => {
    setProgressSteps(prevSteps => prevSteps.map(step => 
        step.id === id ? { ...step, status, label: newLabel || step.label } : step
    ));
  };


  const handleProcess = async () => {
    if (!url.trim()) {
        setErrorMessage("Please enter a valid URL.");
        return;
    };

    setIsProcessing(true);
    setErrorMessage('');
    setProgressSteps(initialSteps);

    try {
        // Step 1: Fetch
        updateStepStatus('fetch', 'loading');
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Could not fetch audio. Status: ${response.status}`);
        const audioBlob = await response.blob();
        updateStepStatus('fetch', 'done');
        
        // Step 2 & 3: Analyze and Transcribe in parallel
        updateStepStatus('analyze', 'loading');
        updateStepStatus('transcribe', 'loading');

        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const emotionPromise = analyzeAudioFileForEmotion(audioBuffer).then(mood => {
            updateStepStatus('analyze', 'done');
            return mood;
        }).catch(err => {
            console.error("Emotion analysis failed:", err);
            updateStepStatus('analyze', 'error', 'Emotion Analysis Failed');
            return null;
        });

        const transcriptionPromise = transcribeAudio(audioBlob).then(transcript => {
            updateStepStatus('transcribe', 'done');
            return transcript;
        }).catch(err => {
            console.error("Transcription failed:", err);
            updateStepStatus('transcribe', 'error', 'Transcription Failed');
            throw new Error("Transcription failed."); // Propagate error
        });
        
        const [detectedMood, transcript] = await Promise.all([emotionPromise, transcriptionPromise]);

        if (transcript) {
            onSend(transcript, detectedMood);
        } else {
            throw new Error("Transcription returned empty.");
        }

    } catch (error: any) {
        console.error("Error processing URL:", error);
        let message = "An unexpected error occurred. Please try again.";
        if (error.message.includes('fetch') || error.message.includes('CORS')) {
            message = "Could not fetch the audio. Please check the URL and ensure it's publicly accessible and allows cross-origin requests (CORS).";
        } else if (error.message.includes('decode')) {
            message = "Could not decode the audio file. The format might be unsupported.";
        } else if (error.message) {
            message = error.message;
        }
        setErrorMessage(message);
        // Mark any remaining loading steps as errored
        setProgressSteps(prev => prev.map(s => s.status === 'loading' ? {...s, status: 'error'} : s));
    } finally {
        setIsProcessing(false);
    }
  }
  
  const StepIcon: React.FC<{ status: StepStatus }> = ({ status }) => {
    switch(status) {
        case 'loading': return <LoadingIcon className="w-5 h-5 text-purple-400" />;
        case 'done': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        case 'error': return <XIcon className="w-5 h-5 text-red-500" />;
        case 'pending':
        default:
            return <CircleIcon className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-fast"
        onClick={onClose}
    >
      <div 
        className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl border flex flex-col transition-colors duration-500 ${isNightMode ? 'bg-slate-900 border-purple-800/40' : 'bg-slate-800 border-purple-500/20'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Process Dream from URL</h2>
          <button onClick={onClose} className="p-1 rounded-full text-purple-300 hover:bg-slate-700 transition">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
            <div>
                <label htmlFor="audio-url" className="font-semibold text-sm text-purple-300 mb-1 block">
                    Audio File URL
                </label>
                <input
                    id="audio-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://.../mydream.mp3"
                    className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition placeholder:text-slate-400 duration-300 text-white ${isNightMode ? 'bg-slate-800' : 'bg-slate-700'}`}
                    disabled={isProcessing}
                />
                 <p className="text-xs text-slate-400 mt-2">
                    Provide a direct link to an audio file (e.g., mp3, wav, webm). The file must be publicly accessible (CORS enabled).
                </p>
            </div>
            
            {isProcessing && (
                 <div className="p-3 bg-slate-800/50 rounded-lg space-y-2">
                    {progressSteps.map(step => (
                        <div key={step.id} className="flex items-center gap-3">
                            <StepIcon status={step.status} />
                            <span className={`text-sm font-medium ${step.status === 'pending' ? 'text-slate-400' : 'text-white'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {errorMessage && (
                 <div className="flex items-start gap-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <AlertTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/>
                    <span className="text-sm text-red-300">{errorMessage}</span>
                </div>
            )}
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button 
            onClick={onClose} 
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isNightMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-600 hover:bg-slate-500'}`}
          >
            Cancel
          </button>
          <button 
            onClick={handleProcess}
            disabled={isProcessing || !url.trim()}
            className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition shadow-lg disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isProcessing ? <LoadingIcon className="w-5 h-5" /> : <CloudUploadIcon className="w-5 h-5" />}
            Process Dream
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
      `}</style>
    </div>
  );
};