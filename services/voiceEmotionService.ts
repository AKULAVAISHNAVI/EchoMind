
import { Mood } from "../types";

// Add Meyda to the global window interface for TypeScript
declare global {
    interface Window {
        Meyda?: any;
    }
}

// Helper function to calculate mean and standard deviation
const getStats = (array: number[]) => {
    if (array.length === 0) return { mean: 0, stdDev: 0 };
    const mean = array.reduce((a, b) => a + b) / array.length;
    const stdDev = Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / array.length);
    return { mean, stdDev };
};

export const analyzeVoiceFeatures = (featuresHistory: any[]): Mood => {
    if (featuresHistory.length < 20) {
        return Mood.Neutral;
    }

    const rmsSeries = featuresHistory.map(f => f.rms).filter(v => typeof v === 'number');
    const centroidSeries = featuresHistory.map(f => f.spectralCentroid).filter(v => typeof v === 'number');
    const flatnessSeries = featuresHistory.map(f => f.spectralFlatness).filter(v => typeof v === 'number');
    const slopeSeries = featuresHistory.map(f => f.spectralSlope).filter(v => typeof v === 'number');
    const rolloffSeries = featuresHistory.map(f => f.spectralRolloff).filter(v => typeof v === 'number');
    
    const numMfccCoeffs = 13;
    const mfccTimeSeries: number[][] = Array(numMfccCoeffs).fill(0).map(() => []);
    featuresHistory.forEach(f => {
        if (f.mfcc && f.mfcc.length === numMfccCoeffs) {
            f.mfcc.forEach((coeff: number, i: number) => {
                mfccTimeSeries[i].push(coeff);
            });
        }
    });

    const rmsStats = getStats(rmsSeries);
    const centroidStats = getStats(centroidSeries);
    const flatnessStats = getStats(flatnessSeries);
    const slopeStats = getStats(slopeSeries);
    const rolloffStats = getStats(rolloffSeries);
    const mfccStats = mfccTimeSeries.map(series => getStats(series));

    const scores = {
        [Mood.Happy]: 0,
        [Mood.Sad]: 0,
        [Mood.Anxious]: 0,
        [Mood.Excited]: 0,
        [Mood.Neutral]: 1,
    };

    if (rmsStats.mean > 0.09) { scores[Mood.Excited] += 2; scores[Mood.Anxious] += 1; }
    else if (rmsStats.mean > 0.05) { scores[Mood.Happy] += 1; scores[Mood.Anxious] += 0.5; }
    else if (rmsStats.mean < 0.02) { scores[Mood.Sad] += 1.5; }

    if (centroidStats.mean > 2500) { scores[Mood.Excited] += 1.5; scores[Mood.Happy] += 0.5; }
    if (centroidStats.mean < 1200) { scores[Mood.Sad] += 1; }

    if (centroidStats.stdDev > 800) { scores[Mood.Excited] += 1; scores[Mood.Happy] += 1; }
    if (centroidStats.stdDev < 300) { scores[Mood.Sad] += 1.5; scores[Mood.Neutral] += 0.5; }
    
    if (slopeStats.mean > -0.05) { scores[Mood.Happy] += 1; scores[Mood.Excited] += 0.5; }
    if (slopeStats.mean < -0.08) { scores[Mood.Sad] += 1; }

    if (mfccStats[1]?.mean > 20) { scores[Mood.Happy] += 1; }
    if (mfccStats[1]?.mean < -10) { scores[Mood.Sad] += 1; }

    if (flatnessStats.mean > 0.2) { scores[Mood.Anxious] += 2; }
    
    if (rolloffStats.mean > 4500) { scores[Mood.Anxious] += 1; scores[Mood.Excited] += 1; }
    
    if (rmsStats.stdDev > 0.05) { scores[Mood.Anxious] += 1; }

    let maxScore = -1;
    let winningMood: Mood = Mood.Neutral;

    for (const mood of Object.keys(scores) as Mood[]) {
        if (scores[mood] > maxScore) {
            maxScore = scores[mood];
            winningMood = mood;
        }
    }
    
    if (winningMood === Mood.Excited && flatnessStats.mean > 0.2) {
        if (scores[Mood.Anxious] > scores[Mood.Excited] * 0.75) {
            winningMood = Mood.Anxious;
        }
    }
    
    if (winningMood === Mood.Happy && rmsStats.mean > 0.09) {
        winningMood = Mood.Excited;
    }

    if (maxScore < 2.5 && winningMood !== Mood.Neutral) {
        return Mood.Neutral;
    }

    return winningMood;
};

export const ensureMeyda = (timeout = 15000): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (window.Meyda) return resolve();

        const backupUrl = 'https://unpkg.com/meyda/dist/meyda.min.js';
        const existingBackup = document.querySelector(`script[src="${backupUrl}"]`);
        
        if (!existingBackup) {
            const script = document.createElement('script');
            script.src = backupUrl;
            script.async = true;
            script.crossOrigin = "anonymous";
            document.head.appendChild(script);
        }

        const startTime = Date.now();
        const check = () => {
            if (window.Meyda) {
                resolve();
            } else if (Date.now() - startTime > timeout) {
                reject(new Error("Meyda audio feature library not found. Please check your internet connection."));
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
};

export const processAudioFile = async (file: File): Promise<{ mood: Mood; optimizedAudio: Blob }> => {
    await ensureMeyda();
    if (!window.Meyda) throw new Error("Meyda library not loaded");

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const channelData = audioBuffer.getChannelData(0); // Use the first channel
    const bufferSize = 512;
    const features: any[] = [];

    // Extract features from the audio buffer in chunks
    for (let i = 0; i < channelData.length; i += bufferSize) {
        const chunk = channelData.slice(i, i + bufferSize);
        let signal = chunk;
        
        if (chunk.length < bufferSize) {
            // Pad the last chunk with zeros if necessary
            signal = new Float32Array(bufferSize);
            signal.set(chunk);
        }

        try {
            const f = window.Meyda.extract(
                ["rms", "spectralCentroid", "spectralFlatness", "mfcc", "spectralSlope", "spectralRolloff"],
                signal
            );
            if (f) features.push(f);
        } catch (e) {
            console.warn("Meyda extraction error on chunk", e);
        }
    }

    const mood = analyzeVoiceFeatures(features);
    
    await audioContext.close();

    // For now, we return the original file as the optimized blob.
    // In a production environment, we might want to re-encode this to a standard format/rate here.
    return { mood, optimizedAudio: file };
};
