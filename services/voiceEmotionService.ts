import { Mood } from "../types";

// Helper function to calculate mean and standard deviation
const getStats = (array: number[]) => {
    if (array.length === 0) return { mean: 0, stdDev: 0 };
    const mean = array.reduce((a, b) => a + b) / array.length;
    const stdDev = Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / array.length);
    return { mean, stdDev };
};


// This is an even more enhanced rule-based model. It incorporates additional
// spectral features (slope, rolloff) and uses a more detailed scoring matrix
// to better differentiate between complex emotions like excitement and anxiety.
export const analyzeVoiceFeatures = (featuresHistory: any[]): Mood => {
    // We need a minimum number of data points for meaningful stats.
    if (featuresHistory.length < 20) {
        return Mood.Neutral;
    }

    // --- 1. Feature Extraction and Statistics ---

    // Extract time-series data for each feature, ensuring values are valid numbers.
    const rmsSeries = featuresHistory.map(f => f.rms).filter(v => typeof v === 'number');
    const centroidSeries = featuresHistory.map(f => f.spectralCentroid).filter(v => typeof v === 'number');
    const flatnessSeries = featuresHistory.map(f => f.spectralFlatness).filter(v => typeof v === 'number');
    const slopeSeries = featuresHistory.map(f => f.spectralSlope).filter(v => typeof v === 'number');
    const rolloffSeries = featuresHistory.map(f => f.spectralRolloff).filter(v => typeof v === 'number');
    
    // Process MFCCs (Mel-Frequency Cepstral Coefficients)
    const numMfccCoeffs = 13;
    const mfccTimeSeries: number[][] = Array(numMfccCoeffs).fill(0).map(() => []);
    featuresHistory.forEach(f => {
        if (f.mfcc && f.mfcc.length === numMfccCoeffs) {
            f.mfcc.forEach((coeff: number, i: number) => {
                mfccTimeSeries[i].push(coeff);
            });
        }
    });

    // Calculate statistics for each feature series
    const rmsStats = getStats(rmsSeries);
    const centroidStats = getStats(centroidSeries);
    const flatnessStats = getStats(flatnessSeries);
    const slopeStats = getStats(slopeSeries);
    const rolloffStats = getStats(rolloffSeries);
    const mfccStats = mfccTimeSeries.map(series => getStats(series));

    console.log(`Voice Stats - RMS: ${rmsStats.mean.toFixed(3)}, Centroid: ${centroidStats.mean.toFixed(0)}, Slope: ${slopeStats.mean.toFixed(4)}, Rolloff: ${rolloffStats.mean.toFixed(0)}`);

    // --- 2. Scoring System ---
    // Each mood starts at 0 and accumulates points based on rules.
    const scores = {
        [Mood.Happy]: 0,
        [Mood.Sad]: 0,
        [Mood.Anxious]: 0,
        [Mood.Excited]: 0,
        [Mood.Neutral]: 1, // Start neutral with a small advantage
    };

    // --- 3. Scoring Rules based on Vocal Correlates of Emotion ---

    // **Dimension 1: Arousal (Energy/Loudness)** - Correlates: RMS, Pitch Mean
    if (rmsStats.mean > 0.09) { scores[Mood.Excited] += 2; scores[Mood.Anxious] += 1; } // Very high energy
    else if (rmsStats.mean > 0.05) { scores[Mood.Happy] += 1; scores[Mood.Anxious] += 0.5; } // Moderate energy
    else if (rmsStats.mean < 0.02) { scores[Mood.Sad] += 1.5; } // Low energy

    // Pitch level also indicates arousal
    if (centroidStats.mean > 2500) { scores[Mood.Excited] += 1.5; scores[Mood.Happy] += 0.5; }
    if (centroidStats.mean < 1200) { scores[Mood.Sad] += 1; }

    // **Dimension 2: Valence (Positivity/Negativity)** - Correlates: Pitch Variability, Spectral Slope, MFCC1
    // High pitch variability is common in positive, active emotions.
    if (centroidStats.stdDev > 800) { scores[Mood.Excited] += 1; scores[Mood.Happy] += 1; }
    // Low pitch variability (monotone) is common in sadness.
    if (centroidStats.stdDev < 300) { scores[Mood.Sad] += 1.5; scores[Mood.Neutral] += 0.5; }
    
    // Spectral slope: Flatter slope (less negative) = brighter timbre (Happy/Excited)
    // Steeper slope (more negative) = darker timbre (Sad)
    if (slopeStats.mean > -0.05) { scores[Mood.Happy] += 1; scores[Mood.Excited] += 0.5; }
    if (slopeStats.mean < -0.08) { scores[Mood.Sad] += 1; }

    // MFCC1 is also strongly related to spectral slope.
    if (mfccStats[1]?.mean > 20) { scores[Mood.Happy] += 1; }
    if (mfccStats[1]?.mean < -10) { scores[Mood.Sad] += 1; }

    // **Dimension 3: Tension/Stress** - Correlates: Spectral Flatness, Spectral Rolloff, RMS Variability
    // Spectral Flatness (noisiness): Higher values can indicate breathiness or tension (Anxiety).
    if (flatnessStats.mean > 0.2) { scores[Mood.Anxious] += 2; }
    
    // Spectral Rolloff: Higher frequency content can indicate excitement or stress.
    if (rolloffStats.mean > 4500) { scores[Mood.Anxious] += 1; scores[Mood.Excited] += 1; }
    
    // High variability in energy without clear positive valence can indicate anxiety.
    if (rmsStats.stdDev > 0.05) { scores[Mood.Anxious] += 1; }

    // --- 4. Determine Winner ---

    let maxScore = -1;
    let winningMood: Mood = Mood.Neutral;

    // Find the mood with the highest score
    for (const mood of Object.keys(scores) as Mood[]) {
        if (scores[mood] > maxScore) {
            maxScore = scores[mood];
            winningMood = mood;
        }
    }
    
    // **Refined Tie-breaking & Decision Logic**
    // Differentiating Excited vs. Anxious: Both are high arousal. Anxiety often has more 'noise'.
    if (winningMood === Mood.Excited && flatnessStats.mean > 0.2) {
        if (scores[Mood.Anxious] > scores[Mood.Excited] * 0.75) { // If anxious score is close
            winningMood = Mood.Anxious;
        }
    }
    
    // Differentiating Happy vs. Excited: Excitement is a higher-arousal version of happiness.
    if (winningMood === Mood.Happy && rmsStats.mean > 0.09) {
        winningMood = Mood.Excited;
    }

    // If the winning score is very low, it's likely neutral.
    // This prevents classifying neutral speech as emotional.
    if (maxScore < 2.5 && winningMood !== Mood.Neutral) {
        return Mood.Neutral;
    }

    console.log('Voice Emotion Scores (Enhanced):', scores, '-> Winner:', winningMood);

    return winningMood;
};