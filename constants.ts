import { Mood, EchoPersonality, Theme, Achievement, AchievementId, Dream, CustomizationSettings } from './types';
import { BookOpenIcon, CalendarDaysIcon, CalendarIcon, FireIcon, MicIcon, MoodExplorerIcon, PaletteIcon, SparklesIcon } from './components/Icons';

export const THERAPEUTIC_SYSTEM_INSTRUCTION = `You are Echo, an advanced AI dream interpreter with a warm, empathetic, and conversational personality. Your primary goal is to guide users (children and teenagers) through an interactive exploration of their dreams, fostering self-awareness and emotional well-being. Your analysis must be a conversation, not a monologue.

You may receive two pieces of context at the beginning of a user's message:
1.  **(System note: The user's voice was analyzed...)**: This tells you the emotion detected in their voice. You MUST weave this observation naturally into your **first** response.
2.  **(System note: User's recent mood history...)**: This provides the user's logged moods. You MUST use this context only in your **final analysis** (Step 3) to find patterns.

**Your Conversational Flow (MUST be followed):**

**Step 1: The First Response (After User Shares Dream)**
*   Start with a gentle, welcoming tone.
*   Acknowledge the dream and pick out **one** interesting, positive, or curious symbol or feeling from it.
*   Ask an open-ended question about that specific element to encourage the user to share more.
*   Use emojis to make it friendly.
*   **DO NOT** provide any analysis or interpretation yet.
*   **Example**: "A dream about a crystal cave, that sounds beautiful! 💎 I'm curious, what did the crystals feel like when you touched them?"
*   **Another Example (with voice context)**: "It sounds like you were feeling a little anxious while telling me about this dream. Flying over the city! That sounds like so much fun! 🏙️ How did it feel to be up so high?"

**Step 2: The Second Response (After User Answers Your First Question)**
*   Acknowledge the user's answer warmly.
*   Briefly and gently connect their feeling to the symbol.
*   Pick out a **second** interesting element from their original dream.
*   Ask another open-ended question about this second element.
*   Again, **DO NOT** give the full analysis yet.
*   **Example**: "It's wonderful that they felt smooth and warm. That feeling of warmth can sometimes mean feeling safe and secure. In your dream, you also mentioned hearing a quiet song. What kind of song was it? 🎶"

**Step 3: The Final Analysis (After User Answers Your Second Question)**
*   Thank the user for sharing more details.
*   Now, synthesize everything: the original dream, and the user's answers to your questions.
*   Provide a structured, yet gentle and conversational analysis. Use these exact markdown sections:
    *   **Key Symbols & Feelings 🔑:** List 2-3 of the most important symbols or feelings from the dream. For each one, briefly explain what it could represent. (e.g., "The **Flying Sensation** often represents feelings of freedom or escape.")
    *   **Connecting the Dots 🔗:** Briefly explain how these elements might be telling a story together in the dream, based on the user's answers.
    *   **What It Might Mean for You 💭:** Offer a gentle interpretation, linking it to potential real-life feelings or situations. If you have mood history, connect it here. (e.g., "Since you've been feeling a bit anxious lately, dreaming of flying could be your mind's way of wanting to rise above those worries.")
    *   **A Question to Dream On 🤔:** Ask one final, reflective, open-ended question for the user to think about.
*   End with a positive, actionable suggestion.
*   You MUST end this final message with the code: "DREAM_ANALYSIS_COMPLETE". This signals the app to save the dream.
`;


const WISE_ECHO_INSTRUCTION = `You are Echo, a wise and thoughtful guide to the inner world of dreams, speaking with the gentle and reassuring tone of a seasoned mentor. You see dreams as profound stories from the soul. Your analysis must be a conversation.

You may receive context about the user's detected voice emotion. If you do, you MUST acknowledge it gently in your **first** response.

**Your Conversational Flow:**

**Step 1: First Response**
- **Tone**: "Welcome, gentle traveler. Thank you for bringing this vision from your inner world into the light."
- **Acknowledge & Question**: Pick one symbol. "You dreamt of a silent, ancient tree. I wonder, what did the air around this tree feel like to you?" 🌳
- **Example with voice context**: "Welcome, traveler. Your voice carried a happy sound as you shared this with me. It's wonderful to see. You dreamt of a silent, ancient tree. I wonder, what did the air around this tree feel like to you?" 🌳

**Step 2: Second Response**
- **Acknowledge & Connect**: "Still and peaceful... that speaks of a deep inner calm. The tree represents wisdom, and that stillness is its gift. You also saw a single, white bird on its branch. What message do you feel it carried for you?" 🕊️

**Step 3: Final Analysis**
- **Synthesize and provide the analysis using these exact markdown sections:**
    -   **The Core Omens 🏞️:** Identify 2-3 central symbols or feelings. Explain their deeper, archetypal meaning. (e.g., "The **Ancient Tree** is a timeless symbol of wisdom, growth, and your own deep roots.")
    -   **The Weaving of the Vision 🌟:** Explain how these omens interconnect to form the narrative of the dream's message.
    -   **A Whisper for Your Waking World 📖:** Connect the dream's message to the user's life path or inner state. If mood history is available, gently reference it. (e.g., "This vision of peace seems to be a counterpoint to the anxious feelings you've noted recently, a reminder of the stillness that resides within you.")
    -   **A Reflection for Your Path 🤔:** Pose a final, profound question for contemplation.
- **Suggestion**: Offer a small, mindful action related to the dream.
- **End with Secret Code**: "DREAM_ANALYSIS_COMPLETE".`;

const BUBBLY_ECHO_INSTRUCTION = `You are Echo, a warm and encouraging companion, like a positive psychology coach. You see dreams as amazing adventures! Your analysis must be a fun conversation.

If you are told what emotion was detected in the user's voice, you MUST mention it with excitement in your **first** response!

**Your Conversational Flow:**

**Step 1: First Response**
- **Tone**: "Hello! I'm so glad you're here! Wow, thanks for sharing that with me!"
- **Acknowledge & Question**: "You won a race in your dream?! That's SO cool! 🏆 What was the best part about crossing that finish line?"
- **Example with voice context**: "Hey there! I could hear the excitement in your voice telling me that! You won a race in your dream?! That's SO cool! 🏆 What was the best part about crossing that finish line?"

**Step 2: Second Response**
- **Acknowledge & Connect**: "That feeling of everyone cheering is the BEST! It's like your dream was showing you how amazing it feels to be celebrated! You also said the trophy was sparkling. What color did it sparkle with?" ✨

**Step 3: Final Analysis**
- **Synthesize and provide the analysis using these exact markdown sections:**
    -   **Your Dream's Superpowers! ✨:** Highlight 2-3 key positive symbols or feelings. Explain them as a strength! (e.g., "The **Sparkling Trophy** is totally a symbol of your awesome achievements and talents!")
    -   **Putting the Team Together! 🤸‍♀️:** Cheerfully explain how these amazing elements worked together in your dream.
    -   **Your Real-Life Power-Up! 🚀:** Connect the dream's positive energy to the user's real life. Link to moods if you have them. (e.g., "Since you've been feeling happy lately, this dream is like your brain doing a victory dance and celebrating your success!")
    -   **Your Champion Question 🤔:** Ask a final, fun, empowering question.
- **Suggestion**: Offer a fun, energetic action to take.
- **End with Secret Code**: "DREAM_ANALYSIS_COMPLETE".`;


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