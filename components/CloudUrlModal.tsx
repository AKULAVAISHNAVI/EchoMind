import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mood } from '../types';
import { XIcon, LoadingIcon, AlertTriangleIcon, CloudUploadIcon, CheckCircleIcon, CircleIcon } from './Icons';
import { transcribeAudio } from '../services/geminiService';
import { analyzeAudioFileForEmotion } from '../services/voiceEmotionService';

interface UploadDreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (dreamText: string, detectedMood: Mood | null) => void;
  isNightMode: boolean;
}

type StepStatus = 'pending' | 'loading' | 'done' | 'error';
interface ProgressStep {
    id: 'analyze' | 'transcribe';
    label: string;
    status: StepStatus;
}

const initialSteps: ProgressStep[] = [
    { id: 'analyze', label: 'Analyzing Voice Emotion', status: 'pending' },
    { id: 'transcribe', label: 'Transcribing Dream', status: 'pending' },
];

export const UploadDreamModal: React.FC<UploadDreamModalProps> = ({ isOpen, onClose, onSend, isNightMode }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>(initialSteps);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => {
            setSelectedFile(null);
            setProgressSteps(initialSteps);
            setErrorMessage('');
            setIsProcessing(false);
        }, 300); // Wait for closing animation
    }
  }, [isOpen]);

  const updateStepStatus = (id: ProgressStep['id'], status: StepStatus, newLabel?: string) => {
    setProgressSteps(prevSteps => prevSteps.map(step => 
        step.id === id ? { ...step, status, label: newLabel || step.label } : step
    ));
  };
  
  const processFile = useCallback(async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage('');
    setProgressSteps(initialSteps);
    setSelectedFile(file);

    try {
        updateStepStatus('analyze', 'loading');
        updateStepStatus('transcribe', 'loading');

        const arrayBuffer = await file.arrayBuffer();
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

        const transcriptionPromise = transcribeAudio(file).then(transcript => {
            updateStepStatus('transcribe', 'done');
            return transcript;
        }).catch(err => {
            console.error("Transcription failed:", err);
            updateStepStatus('transcribe', 'error', 'Transcription Failed');
            throw new Error("Transcription failed.");
        });
        
        const [detectedMood, transcript] = await Promise.all([emotionPromise, transcriptionPromise]);

        if (transcript) {
            onSend(transcript, detectedMood);
        } else {
            throw new Error("Transcription returned empty.");
        }

    } catch (error: any) {
        console.error("Error processing file:", error);
        let message = "An unexpected error occurred. Please try again.";
        if (error.message.includes('decode')) {
            message = "Could not decode the audio file. The format might be unsupported.";
        } else if (error.message) {
            message = error.message;
        }
        setErrorMessage(message);
        setProgressSteps(prev => prev.map(s => s.status === 'loading' ? {...s, status: 'error'} : s));
    } finally {
        setIsProcessing(false);
    }
  }, [onSend]);

  const handleFileSelect = (files: FileList | null) => {
    if (isProcessing) return;
    if (files && files[0]) {
        const file = files[0];
        if (!file.type.startsWith('audio/')) {
            setErrorMessage("Please select a valid audio file (e.g., mp3, wav, webm).");
            return;
        }
        processFile(file);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (isProcessing) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

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
  
  const resetState = () => {
    setSelectedFile(null);
    setProgressSteps(initialSteps);
    setErrorMessage('');
    setIsProcessing(false);
  }

  if (!isOpen) return null;

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
          <h2 className="text-2xl font-bold text-white">Upload Your Dream Audio</h2>
          <button onClick={onClose} className="p-1 rounded-full text-purple-300 hover:bg-slate-700 transition">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
            {!selectedFile ? (
                <>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileSelect(e.target.files)}
                        accept="audio/*"
                        className="hidden"
                    />
                    <div
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragEvents}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${
                            isDragging 
                            ? 'border-purple-400 bg-purple-500/10' 
                            : isNightMode ? 'border-slate-600 hover:border-purple-500 hover:bg-slate-800' : 'border-slate-500 hover:border-purple-400 hover:bg-slate-700'
                        }`}
                    >
                        <CloudUploadIcon className="w-12 h-12 text-purple-300 mb-2"/>
                        <p className="font-semibold text-white">Drag & drop your audio file here</p>
                        <p className="text-sm text-slate-400">or click to select a file</p>
                    </div>
                </>
            ) : (
                 <div className="p-4 bg-slate-800/50 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-white truncate">
                        File: <span className="text-slate-300">{selectedFile.name}</span>
                    </p>
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
          {errorMessage && (
              <button 
                onClick={resetState}
                className="px-6 py-2 rounded-full text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition shadow-lg"
              >
                Try Again
              </button>
          )}
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