

// FIX: Import ComponentType and SVGProps from React to use as types.
import type { ComponentType, SVGProps } from 'react';

export enum Sender {
  User = 'user',
  AI = 'ai',
  System = 'system',
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
}

export enum Mood {
  Happy = 'Happy',
  Sad = 'Sad',
  Anxious = 'Anxious',
  Excited = 'Excited',
  Neutral = 'Neutral',
}

export interface Dream {
  id: string;
  date: string;
  dream: string;
  analysis: string;
  emotion: string;
  mood?: Mood;
  detectedEmotion?: Mood;
  imageUrl?: string;
}

export enum View {
  Chat = 'chat',
  Journal = 'journal',
}

export enum EchoAvatar {
  Default = 'default',
  Star = 'star',
  Moon = 'moon',
}

export enum EchoPersonality {
  Magical = 'magical',
  Wise = 'wise',
  Bubbly = 'bubbly',
}

export enum Theme {
  Default = 'default',
  Ocean = 'ocean',
  Sunset = 'sunset',
  Galaxy = 'galaxy',
  Forest = 'forest',
}

export enum TextSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
}

export interface CustomizationSettings {
  avatar: EchoAvatar;
  personality: EchoPersonality;
  theme: Theme;
  textSize: TextSize;
  reduceMotion: boolean;
  // FIX: Removed `dreams` from settings to avoid state duplication. Dreams are managed by a separate state.
}

export enum AchievementId {
    DreamRookie = 'DREAM_ROOKIE',
    ConsistentDreamer = 'CONSISTENT_DREAMER',
    WeekLongJourney = 'WEEK_LONG_JOURNEY',
    MoodExplorer = 'MOOD_EXPLORER',
    VoiceVirtuoso = 'VOICE_VIRTUOSO',
    ThemeChanger = 'THEME_CHANGER',
    PersonalityPal = 'PERSONALITY_PAL',
}

export interface Achievement {
    id: AchievementId;
    name: string;
    description: string;
    // FIX: Use imported types to fix 'Cannot find namespace React' error.
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    isUnlocked: (dreams: Dream[], settings: CustomizationSettings) => boolean;
}