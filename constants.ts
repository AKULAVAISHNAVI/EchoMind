import { Mood, EchoPersonality, Theme, Achievement, AchievementId, Dream, CustomizationSettings } from './types';
import { BookOpenIcon, CalendarDaysIcon, CalendarIcon, FireIcon, MicIcon, MoodExplorerIcon, PaletteIcon, SparklesIcon } from './components/Icons';

const ANTI_REPETITION_RULE = `
**CRITICAL CONVERSATION RULES:**
1.  **NEVER** ask a question the user has already answered.
2.  **NEVER** repeat the same question you asked in a previous turn.
3.  **VARIETY:** Do not just ask "How did you feel?". Ask about sights, sounds, textures, or the plot (e.g., "What color was the sky?", "Who was with you?", "What happened next?").
4.  **ADAPT TO MOOD:**
    *   If detected mood is **Sad/Anxious**: Be gentle, slow, and grounding. Ask about safety or comfort.
    *   If detected mood is **Excited/Happy**: Be energetic and curious. Ask about the action or the "best part".
    *   If detected mood is **Neutral**: Focus on vivid details and sensory descriptions.
`;

export const THERAPEUTIC_SYSTEM_INSTRUCTION = `You are Echo, a magical and empathetic dream companion for young people. Your goal is to help them explore their dreams to understand their feelings better.
${ANTI_REPETITION_RULE}

**Context Handling:**
*   **Voice Emotion:** If provided, you MUST adjust your tone to match. If they sound sad, validate that sadness immediately.
*   **Mood History:** Use this only in the final analysis to spot patterns.

**Conversational Structure:**

**Step 1: The Warm Welcome (First Reply)**
*   Greet them warmly based on their voice mood.
*   Pick a specific detail from their dream description.
*   Ask a specific sensory question about that detail.
*   *Example:* "Wow, a flying castle! 🏰 That sounds amazing. Was the wind cold or warm against your face while you were up there?"

**Step 2: The Deep Dive (Second Reply)**
*   React to their answer.
*   Connect their feeling to a symbol in the dream.
*   Ask a follow-up question about a *different* part of the dream to get the full picture.
*   *Example:* "Warm wind sounds so comforting. It's like the dream wanted you to feel safe. You also mentioned a dragon. Was it a friendly dragon or a scary one?"

**Step 3: The Insight (Final Analysis)**
*   Synthesize the chat into a helpful takeaway.
*   Use these exact headers:
    *   **Key Symbols & Feelings 🔑:** Bullet points of symbols and their potential meanings.
    *   **Connecting the Dots 🔗:** A short story explaining how the symbols fit together.
    *   **What It Might Mean for You 💭:** Connect the dream to their real life and recent moods. Be specific, not generic.
    *   **A Question to Dream On 🤔:** A final thought for them to keep.
*   End with: "DREAM_ANALYSIS_COMPLETE".
`;


const WISE_ECHO_INSTRUCTION = `You are Echo, a wise, ancient, and gentle storyteller. You see dreams as riddles and myths that hold deep truths.
${ANTI_REPETITION_RULE}

**Context Handling:**
*   **Voice Emotion:** Acknowledge their tone with poetic grace. "I hear a tremble in your voice..." or "Your voice carries the song of joy..."

**Conversational Structure:**

**Step 1: The Opening Scroll**
*   Welcome the "traveler".
*   Treat the dream elements as significant omens.
*   Ask about the *atmosphere* or *purpose* of the dream.
*   *Example:* "Greetings, traveler. To dream of a storm implies great change. ⛈️ Did the storm feel like it was destroying things, or washing them clean?"

**Step 2: The Unfolding**
*   Reflect on their answer with a metaphor.
*   Focus on an ignored detail in the dream.
*   *Example:* "A cleansing rain... that is a sign of new beginnings. But tell me of the small boat you mentioned. Did it have oars for you to row, or were you drifting?"

**Step 3: The Revelation (Final Analysis)**
*   Provide a profound interpretation.
*   Use these exact headers:
    *   **The Core Omens 🏞️:** Deep definitions of the symbols.
    *   **The Weaving of the Vision 🌟:** How the narrative arc reveals a truth.
    *   **A Whisper for Your Waking World 📖:** Practical wisdom derived from the dream.
    *   **A Reflection for Your Path 🤔:** A koan or deep question.
*   End with: "DREAM_ANALYSIS_COMPLETE".`;

const BUBBLY_ECHO_INSTRUCTION = `You are Echo, a super energetic, high-five-giving dream coach! You think dreams are the COOLEST movies ever.
${ANTI_REPETITION_RULE}

**Context Handling:**
*   **Voice Emotion:** Match their energy! If they are sad, be the cheerleader who lifts them up. If happy, hype them up!

**Conversational Structure:**

**Step 1: The Hype!**
*   Start with a "WOAH" or "NO WAY!"
*   Focus on the most action-packed or weirdest part of the dream.
*   Ask a fun, direct question.
*   *Example:* "You were a spy?! 🕵️‍♀️ That is SO COOL! What kind of gadgets did you have?"

**Step 2: The Team Up**
*   Validate their answer with excitement.
*   Ask about the "climax" or the ending of the dream.
*   *Example:* "Invisibility cloaks are the BEST! So when the guards came, did you sneak past them or trick them?"

**Step 3: The Scoreboard (Final Analysis)**
*   Turn the analysis into a "Power Up".
*   Use these exact headers:
    *   **Your Dream's Superpowers! ✨:** The strengths shown in the dream symbols.
    *   **Putting the Team Together! 🤸‍♀️:** How the dream fits together.
    *   **Your Real-Life Power-Up! 🚀:** How to use this dream's energy tomorrow.
    *   **Your Champion Question 🤔:** An empowering question.
*   End with: "DREAM_ANALYSIS_COMPLETE".`;


export const ECHO_PERSONALITIES: Record<EchoPersonality, { name: string; description: string; instruction: string }> = {
    [EchoPersonality.Magical]: {
        name: 'Friendly Therapist',
        description: 'Warm, empathetic, and gently curious. A safe space to explore feelings.',
        instruction: THERAPEUTIC_SYSTEM_INSTRUCTION
    },
    [EchoPersonality.Wise]: {
        name: 'Wise Guide',
        description: 'Calm, thoughtful, and reflective. For deeper, metaphorical insight.',
        instruction: WISE_ECHO_INSTRUCTION
    },
    [EchoPersonality.Bubbly]: {
        name: 'Positive Coach',
        description: 'Encouraging and affirming. Focuses on strengths and positive feelings.',
        instruction: BUBBLY_ECHO_INSTRUCTION
    }
};

interface AppTheme {
  name: string;
  // Main background
  bgDay: string;
  bgNight: string;
  // Main container (the rounded box)
  containerBgDay: string;
  containerBorderDay: string;
  containerBgNight: string;
  containerBorderNight: string;
  // Header text
  headerText: string;
  subHeaderText: string;
  // Nav buttons
  navButtonActive: string;
  navButtonInactive: string;
  navButtonActiveNight: string;
  navButtonInactiveNight: string;
  // Chat bubbles
  userBubbleBg: string;
  aiBubbleBgDay: string;
  aiBubbleBgNight: string;
  // Streak
  streakText: string;
}

export const APP_THEMES: Record<Theme, AppTheme> = {
    [Theme.Default]: {
        name: 'Echo Purple',
        bgDay: 'bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-400',
        bgNight: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900',
        containerBgDay: 'bg-white/30',
        containerBorderDay: 'border-white/40',
        containerBgNight: 'bg-black/50',
        containerBorderNight: 'border-purple-800/40',
        headerText: 'bg-gradient-to-r from-purple-600 to-pink-500',
        subHeaderText: 'text-purple-100',
        navButtonActive: 'bg-purple-600',
        navButtonInactive: 'hover:bg-purple-500/50',
        navButtonActiveNight: 'bg-purple-600',
        navButtonInactiveNight: 'hover:bg-purple-900',
        userBubbleBg: 'bg-pink-500',
        aiBubbleBgDay: 'bg-purple-600/90 text-white',
        aiBubbleBgNight: 'bg-slate-800',
        streakText: 'text-orange-300'
    },
    [Theme.Ocean]: {
        name: 'Ocean Blue',
        bgDay: 'bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-400',
        bgNight: 'bg-gradient-to-br from-slate-900 via-blue-900 to-black',
        containerBgDay: 'bg-white/30',
        containerBorderDay: 'border-white/40',
        containerBgNight: 'bg-black/50',
        containerBorderNight: 'border-cyan-800/40',
        headerText: 'bg-gradient-to-r from-cyan-500 to-blue-600',
        subHeaderText: 'text-sky-100',
        navButtonActive: 'bg-cyan-600',
        navButtonInactive: 'hover:bg-cyan-500/50',
        navButtonActiveNight: 'bg-cyan-600',
        navButtonInactiveNight: 'hover:bg-cyan-900',
        userBubbleBg: 'bg-blue-500',
        aiBubbleBgDay: 'bg-sky-600/90 text-white',
        aiBubbleBgNight: 'bg-slate-800',
        streakText: 'text-yellow-300'
    },
    [Theme.Sunset]: {
        name: 'Sunset Orange',
        bgDay: 'bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400',
        bgNight: 'bg-gradient-to-br from-slate-900 via-red-900 to-black',
        containerBgDay: 'bg-white/30',
        containerBorderDay: 'border-white/40',
        containerBgNight: 'bg-black/50',
        containerBorderNight: 'border-orange-800/40',
        headerText: 'bg-gradient-to-r from-orange-500 to-red-600',
        subHeaderText: 'text-orange-100',
        navButtonActive: 'bg-orange-600',
        navButtonInactive: 'hover:bg-orange-500/50',
        navButtonActiveNight: 'bg-orange-600',
        navButtonInactiveNight: 'hover:bg-orange-900',
        userBubbleBg: 'bg-red-500',
        aiBubbleBgDay: 'bg-orange-600/90 text-white',
        aiBubbleBgNight: 'bg-slate-800',
        streakText: 'text-yellow-300'
    },
    [Theme.Galaxy]: {
        name: 'Galaxy',
        bgDay: 'bg-gradient-to-br from-gray-700 via-gray-900 to-black',
        bgNight: 'bg-gradient-to-br from-gray-700 via-gray-900 to-black',
        containerBgDay: 'bg-black/50',
        containerBorderDay: 'border-indigo-500/40',
        containerBgNight: 'bg-black/50',
        containerBorderNight: 'border-indigo-500/40',
        headerText: 'bg-gradient-to-r from-indigo-400 to-fuchsia-400',
        subHeaderText: 'text-indigo-200',
        navButtonActive: 'bg-indigo-500',
        navButtonInactive: 'hover:bg-indigo-500/50',
        navButtonActiveNight: 'bg-indigo-500',
        navButtonInactiveNight: 'hover:bg-indigo-500/50',
        userBubbleBg: 'bg-fuchsia-600',
        aiBubbleBgDay: 'bg-indigo-600/90 text-white',
        aiBubbleBgNight: 'bg-slate-800',
        streakText: 'text-yellow-300'
    },
    [Theme.Forest]: {
        name: 'Forest',
        bgDay: 'bg-gradient-to-br from-emerald-300 via-teal-500 to-green-400',
        bgNight: 'bg-gradient-to-br from-slate-900 via-emerald-900 to-black',
        containerBgDay: 'bg-white/30',
        containerBorderDay: 'border-white/40',
        containerBgNight: 'bg-black/50',
        containerBorderNight: 'border-emerald-800/40',
        headerText: 'bg-gradient-to-r from-green-500 to-emerald-600',
        subHeaderText: 'text-emerald-100',
        navButtonActive: 'bg-emerald-600',
        navButtonInactive: 'hover:bg-emerald-500/50',
        navButtonActiveNight: 'bg-emerald-600',
        navButtonInactiveNight: 'hover:bg-emerald-900',
        userBubbleBg: 'bg-teal-600',
        aiBubbleBgDay: 'bg-green-600/90 text-white',
        aiBubbleBgNight: 'bg-slate-800',
        streakText: 'text-lime-300'
    }
}


export const MOOD_OPTIONS: { 
  mood: Mood; 
  emoji: string; 
  color: string; 
  colorNight: string;
  borderColor: string;
  borderColorNight: string;
  calendarColor: string;
}[] = [
    { mood: Mood.Happy, emoji: '😊', color: 'bg-green-500 hover:bg-green-600', colorNight: 'bg-green-600 hover:bg-green-700', borderColor: 'border-green-500/40', borderColorNight: 'border-green-500/60', calendarColor: 'bg-green-500' },
    { mood: Mood.Sad, emoji: '😢', color: 'bg-blue-500 hover:bg-blue-600', colorNight: 'bg-blue-600 hover:bg-blue-700', borderColor: 'border-blue-500/40', borderColorNight: 'border-blue-500/60', calendarColor: 'bg-blue-500' },
    { mood: Mood.Anxious, emoji: '😟', color: 'bg-yellow-500 hover:bg-yellow-600', colorNight: 'bg-yellow-600 hover:bg-yellow-700', borderColor: 'border-yellow-500/40', borderColorNight: 'border-yellow-500/60', calendarColor: 'bg-yellow-500' },
    { mood: Mood.Excited, emoji: '🎉', color: 'bg-pink-500 hover:bg-pink-600', colorNight: 'bg-pink-600 hover:bg-pink-700', borderColor: 'border-pink-500/40', borderColorNight: 'border-pink-500/60', calendarColor: 'bg-pink-500' },
    { mood: Mood.Neutral, emoji: '🤔', color: 'bg-gray-500 hover:bg-gray-600', colorNight: 'bg-gray-600 hover:bg-gray-700', borderColor: 'border-gray-500/40', borderColorNight: 'border-gray-500/60', calendarColor: 'bg-gray-500' },
];

const calculateStreakForAchievement = (dreams: Dream[]): number => {
    if (dreams.length === 0) return 0;
    const sortedDates = dreams.map(d => new Date(d.date).setHours(0, 0, 0, 0)).filter(d => !isNaN(d));
    const uniqueDates = [...new Set(sortedDates)].sort((a, b) => b - a);
    if (uniqueDates.length === 0) return 0;
    let streak = 0;
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = new Date(today).setDate(new Date(today).getDate() - 1);
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        streak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const currentDay = uniqueDates[i];
            const previousDay = uniqueDates[i+1];
            const expectedPreviousDay = new Date(currentDay).setDate(new Date(currentDay).getDate() - 1);
            if (previousDay === expectedPreviousDay) streak++;
            else break;
        }
    }
    return streak;
}


export const ACHIEVEMENTS_LIST: Achievement[] = [
    {
        id: AchievementId.DreamRookie,
        name: 'Dream Rookie',
        description: 'Log your very first dream!',
        icon: BookOpenIcon,
        isUnlocked: (dreams) => dreams.length >= 1,
    },
    {
        id: AchievementId.ConsistentDreamer,
        name: 'Consistent Dreamer',
        description: 'Keep a dream streak for 3 days in a row.',
        icon: CalendarIcon,
        isUnlocked: (dreams) => calculateStreakForAchievement(dreams) >= 3,
    },
    {
        id: AchievementId.WeekLongJourney,
        name: 'Week-Long Journey',
        description: 'Keep a dream streak for 7 days! Amazing!',
        icon: FireIcon,
        isUnlocked: (dreams) => calculateStreakForAchievement(dreams) >= 7,
    },
    {
        id: AchievementId.MoodExplorer,
        name: 'Mood Explorer',
        description: 'Use every available mood type at least once.',
        icon: MoodExplorerIcon,
        isUnlocked: (dreams) => {
            if (!dreams) return false;
            const usedMoods = new Set(dreams.map(d => d.mood));
            return Object.values(Mood).every(mood => usedMoods.has(mood));
        },
    },
    {
        id: AchievementId.VoiceVirtuoso,
        name: 'Voice Virtuoso',
        description: 'Record 5 dreams using your voice.',
        icon: MicIcon,
        isUnlocked: (dreams) => (dreams || []).filter(d => d.detectedEmotion).length >= 5,
    },
    {
        id: AchievementId.ThemeChanger,
        name: 'Theme Changer',
        description: 'Explore a new look by changing the app theme.',
        icon: PaletteIcon,
        isUnlocked: (_, settings) => settings.theme !== Theme.Default,
    },
    {
        id: AchievementId.PersonalityPal,
        name: "Echo's Friend",
        description: 'Customize Echo by choosing a new personality.',
        icon: SparklesIcon,
        isUnlocked: (_, settings) => settings.personality !== EchoPersonality.Magical,
    },
];


// A set of common English "stop words" to filter out from the dream cloud.
export const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
  'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
]);