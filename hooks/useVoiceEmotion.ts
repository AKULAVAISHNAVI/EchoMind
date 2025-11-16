import { useState, useRef, useCallback } from 'react';
import { Mood } from '../types';
import { analyzeVoiceFeatures } from '../services/voiceEmotionService';

// Add Meyda to the global window interface for TypeScript
declare global {
    interface Window {
        Meyda: any;
    }
}

let audioContext: AudioContext | null = null;

export const useVoiceEmotion = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [detectedMood, setDetectedMood] = useState<Mood | null>(null);
    const [realtimeMood, setRealtimeMood] = useState<Mood | null>(null);

    const meydaAnalyzer = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const featuresRef = useRef<any[]>([]);
    const callbackCounterRef = useRef(0);

    const startEmotionAnalysis = useCallback(async () => {
        if (isAnalyzing || !window.Meyda) return;

        try {
            if (!audioContext) {
                audioContext = new AudioContext();
            }
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const source = audioContext.createMediaStreamSource(stream);
            
            featuresRef.current = [];
            callbackCounterRef.current = 0;

            meydaAnalyzer.current = window.Meyda.createMeydaAnalyzer({
                audioContext: audioContext,
                source: source,
                bufferSize: 512,
                featureExtractors: ["rms", "spectralCentroid", "spectralFlatness", "mfcc", "spectralSlope", "spectralRolloff"],
                callback: (features: any) => {
                    featuresRef.current.push(features);
                    callbackCounterRef.current += 1;

                    // Provide real-time feedback by analyzing recent features periodically
                    if (callbackCounterRef.current % 30 === 0 && featuresRef.current.length > 20) {
                        // Analyze the last ~1.5 seconds of features for a stable reading
                        const recentFeatures = featuresRef.current.slice(-60);
                        const mood = analyzeVoiceFeatures(recentFeatures);
                        setRealtimeMood(mood);
                    }
                },
            });

            meydaAnalyzer.current.start();
            setIsAnalyzing(true);
            setDetectedMood(null);
            setRealtimeMood(null);

        } catch (err) {
            console.error('Error starting voice emotion analysis:', err);
        }
    }, [isAnalyzing]);
    
    const stopEmotionAnalysis = useCallback(async (): Promise<Mood | null> => {
        if (!isAnalyzing || !meydaAnalyzer.current) return null;
        
        meydaAnalyzer.current.stop();
        streamRef.current?.getTracks().forEach(track => track.stop());
        setIsAnalyzing(false);
        setRealtimeMood(null);

        if (featuresRef.current.length > 20) {
            const mood = analyzeVoiceFeatures(featuresRef.current);
            setDetectedMood(mood);
            return mood;
        }

        return null;

    }, [isAnalyzing]);

    return { isAnalyzing, detectedMood, realtimeMood, startEmotionAnalysis, stopEmotionAnalysis };
};