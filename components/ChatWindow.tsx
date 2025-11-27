
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChatMessage, Dream, Sender, Mood, CustomizationSettings } from '../types';
import { analyzeDream } from '../services/geminiService';
import { PaperPlaneIcon, UserIcon, EchoAvatarIcon, MicIcon, CheckCircleIcon, CloudUploadIcon } from './Icons';
import { MOOD_OPTIONS, ECHO_PERSONALITIES, APP_THEMES } from '../constants';
import { RecordDreamModal } from './RecordDreamModal';
import { UploadDreamModal } from './CloudUrlModal';
import { useVoiceEmotion } from '../hooks/useVoiceEmotion';

interface ChatWindowProps {
  addDream: (dream: Dream) => void;
  isNightMode: boolean;
  settings: CustomizationSettings;
  themeStyles: typeof APP_THEMES[keyof typeof APP_THEMES];
  animationsEnabled: boolean;
  dreams: Dream[]; // Pass dreams to get recent moods
}

const ChatBubble: React.FC<{ message: ChatMessage, isNightMode: boolean, settings: CustomizationSettings, themeStyles: typeof APP_THEMES[keyof typeof APP_THEMES], animationsEnabled: boolean }> = ({ message, isNightMode, settings, themeStyles, animationsEnabled }) => {
  const isAI = message.sender === Sender.AI || message.sender === Sender.System;
  
  const aiBubbleClass = isNightMode ? themeStyles.aiBubbleBgNight : themeStyles.aiBubbleBgDay;
  const userBubbleClass = themeStyles.userBubbleBg;

  // Use a regex to find and replace markdown for bolding (**text**)
  const formattedText = message.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return (
    <div className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'} ${animationsEnabled ? 'animate-bubble-in' : ''}`}>
      {isAI && <div className={`flex-shrink-0 w-8 h-8 rounded-full ${aiBubbleClass} flex items-center justify-center ${animationsEnabled ? 'animate-idle-bob' : ''}`}>
          <EchoAvatarIcon avatar={settings.avatar} className="w-5 h-5 text-white" />
        </div>}
      <div className={`max-w-md md:max-w-lg px-4 py-3 rounded-2xl transition-colors duration-300 ${
          isAI 
            ? aiBubbleClass + ' rounded-bl-lg'
            : userBubbleClass + ' rounded-br-lg text-white'
        }`}>
        <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formattedText }}></p>
      </div>
       {!isAI && <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${userBubbleClass}`}><UserIcon className="w-5 h-5 text-white" /></div>}
    </div>
  );
};

interface MoodSelectorProps {
    onSelectMood: (mood: Mood) => void;
    isNightMode: boolean;
    detectedEmotion?: Mood | null;
    animationsEnabled: boolean;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelectMood, isNightMode, animationsEnabled }) => (
    <div className={`flex-shrink-0 mt-4 p-4 rounded-xl ${animationsEnabled ? 'animate-fade-in' : ''} transition-colors duration-300 ${isNightMode ? 'bg-black/40' : 'bg-black/20'}`}>
        <h3 className="text-center font-bold text-white mb-3">How did this dream make you feel overall?</h3>
        <div className="flex justify-center items-center gap-2 sm:gap-4 flex-wrap">
            {MOOD_OPTIONS.map(({ mood, emoji, color, colorNight }) => (
                <button
                    key={mood}
                    onClick={() => onSelectMood(mood)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-white transition-transform transform ${animationsEnabled ? 'hover:scale-105 active:scale-100' : ''} ${isNightMode ? colorNight : color}`}
                    aria-label={mood}
                >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs font-medium">{mood}</span>
                </button>
            ))}
        </div>
    </div>
);


export const ChatWindow: React.FC<ChatWindowProps> = ({ addDream, isNightMode, settings, themeStyles, animationsEnabled, dreams }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'initial', sender: Sender.System, text: "Hello! I'm Echo, your dream buddy. I'm here to listen whenever you're ready to share your dream." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingDream, setPendingDream] = useState<Omit<Dream, 'mood'> | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isVoiceSending, setIsVoiceSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { realtimeMood, startEmotionAnalysis, stopEmotionAnalysis } = useVoiceEmotion();
  
  const recentMoodHistory = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return dreams
      .filter(dream => new Date(dream.date) >= sevenDaysAgo && dream.mood)
      .map(dream => dream.mood as Mood)
      .slice(0, 10); // Limit to last 10 moods to keep context concise
  }, [dreams]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendDream = async (dreamText: string, detectedEmotion: Mood | null) => {
    if (!dreamText.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), sender: Sender.User, text: dreamText };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const systemInstruction = ECHO_PERSONALITIES[settings.personality].instruction;
      // Filter out system messages (including initial greeting and confirmations) to keep clean User/Model history
      const historyForAI = updatedMessages.filter(msg => msg.sender !== Sender.System);
      
      const response = await analyzeDream(historyForAI, systemInstruction, detectedEmotion, recentMoodHistory);
      
      const analysisCompleteMarker = "DREAM_ANALYSIS_COMPLETE";
      const cleanedResponse = response.replace(analysisCompleteMarker, '').trim();
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: Sender.AI,
        text: cleanedResponse,
      };
      setMessages(prev => [...prev, aiMessage]);

      if (response.includes(analysisCompleteMarker)) {
        
        const emotionKeywords = ['felt', 'feeling', 'was'];
        let emotion = 'Not specified';
        for (const line of dreamText.split('\n')) {
            const lowerLine = line.toLowerCase();
            for (const keyword of emotionKeywords) {
                if (lowerLine.includes(keyword)) {
                    emotion = line.trim();
                    break;
                }
            }
            if (emotion !== 'Not specified') break;
        }

        const dreamToSave: Omit<Dream, 'mood'> = {
            id: new Date().toISOString(),
            date: new Date().toISOString(),
            dream: dreamText,
            analysis: cleanedResponse,
            emotion: emotion,
            detectedEmotion: detectedEmotion ?? undefined,
        };
        setPendingDream(dreamToSave);
      }

    } catch (error) {
      console.error("Error analyzing dream:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: Sender.System,
        text: "Oops! Something went wrong. Please try again later.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendDream(input, null);
    setInput('');
  }

  const handleMoodSelect = (mood: Mood) => {
    if (!pendingDream) return;

    const completeDream: Dream = { ...pendingDream, mood };
    addDream(completeDream);
    setPendingDream(null);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    const confirmationMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: Sender.System,
      text: "Thank you for sharing. I've gently saved this dream to your journal for you to reflect on later. 📔✨",
    };
    setMessages(prev => [...prev, confirmationMessage]);
  };
  
  const handleVoiceSendStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isLoading || !input.trim()) return;
    setIsVoiceSending(true);
    startEmotionAnalysis();
  };

  const handleVoiceSendEnd = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isVoiceSending) return;
    
    setIsVoiceSending(false);
    const mood = await stopEmotionAnalysis();
    
    if (input.trim()) {
      handleSendDream(input, mood);
      setInput('');
    }
  };

  const handleVoiceSendCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isVoiceSending) {
        setIsVoiceSending(false);
        stopEmotionAnalysis(); // Stop analysis without sending
    }
  };
  
  const realtimeMoodStyles = realtimeMood ? MOOD_OPTIONS.find(m => m.mood === realtimeMood) : null;
  const voiceSendButtonBg = isVoiceSending 
    ? (realtimeMoodStyles ? (isNightMode ? realtimeMoodStyles.colorNight.split(' ')[0] : realtimeMoodStyles.color.split(' ')[0]) : 'bg-red-500')
    : themeStyles.userBubbleBg;

  // Determine button text based on chat state
  const isConversationStarted = messages.length > 2;

  return (
    <div className="flex flex-col h-full min-h-[60vh] relative">
       {showToast && (
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${animationsEnabled ? 'animate-toast-in-out' : ''} ${isNightMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white'}`}>
                <CheckCircleIcon className="w-5 h-5" />
                <span>Dream saved to your journal!</span>
            </div>
        )}
      <div className="flex-grow space-y-4 overflow-y-auto pr-2">
        {messages.map(msg => <ChatBubble key={msg.id} message={msg} isNightMode={isNightMode} settings={settings} themeStyles={themeStyles} animationsEnabled={animationsEnabled} />)}
        {isLoading && (
          <div className={`flex items-start gap-3 justify-start ${animationsEnabled ? 'animate-bubble-in' : ''}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${isNightMode ? themeStyles.aiBubbleBgNight : themeStyles.aiBubbleBgDay} flex items-center justify-center ${animationsEnabled ? 'animate-avatar-pulse' : ''}`}>
                <EchoAvatarIcon avatar={settings.avatar} className="w-5 h-5 text-white" />
            </div>
            <div className={`max-w-md md:max-w-lg px-4 py-3 rounded-2xl rounded-bl-lg transition-colors duration-300 ${isNightMode ? themeStyles.aiBubbleBgNight : themeStyles.aiBubbleBgDay}`}>
              <div className="typing-indicator text-white/80">
                  <span></span>
                  <span></span>
                  <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {pendingDream ? (
        <MoodSelector onSelectMood={handleMoodSelect} isNightMode={isNightMode} animationsEnabled={animationsEnabled} />
      ) : (
        <div className="flex-shrink-0 mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsRecordModalOpen(true)}
                    className={`flex-grow flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all duration-300 ${themeStyles.userBubbleBg} hover:opacity-90 text-white ${animationsEnabled ? 'active:scale-95' : ''}`}
                    disabled={isLoading}
                >
                    <MicIcon className="w-5 h-5" />
                    {isConversationStarted ? "Record Reply" : "Record Dream"}
                </button>
                 {!isConversationStarted && (
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className={`p-3 rounded-xl transition-all duration-300 ${themeStyles.userBubbleBg} hover:opacity-90 text-white ${animationsEnabled ? 'active:scale-95' : ''}`}
                        disabled={isLoading}
                        aria-label="Upload Dream Audio"
                    >
                        <CloudUploadIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                    }}
                    placeholder={isConversationStarted ? "Reply to Echo..." : "... or type your dream here"}
                    className={`flex-grow w-full p-3 rounded-xl resize-none focus:ring-2 focus:outline-none transition placeholder:text-white/60 duration-300 text-white ${isNightMode ? 'bg-black/30 focus:ring-white/50' : 'bg-black/20 focus:ring-white/50'}`}
                    rows={1}
                    disabled={isLoading}
                />
                <button
                    type="button"
                    onMouseDown={handleVoiceSendStart}
                    onMouseUp={handleVoiceSendEnd}
                    onMouseLeave={handleVoiceSendCancel}
                    onTouchStart={handleVoiceSendStart}
                    onTouchEnd={handleVoiceSendEnd}
                    className={`p-3 rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-50 ${voiceSendButtonBg} ${isVoiceSending ? 'scale-110 animate-pulse' : `hover:opacity-90 ${animationsEnabled ? 'active:scale-95' : ''}`}`}
                    disabled={isLoading || !input.trim()}
                    aria-label="Hold to send with voice emotion"
                >
                    <MicIcon className="w-6 h-6 text-white" />
                </button>
                <button
                    type="submit"
                    className={`p-3 rounded-full transition-all disabled:cursor-not-allowed ${themeStyles.userBubbleBg} hover:opacity-90 disabled:opacity-50 ${animationsEnabled ? 'active:scale-95' : ''}`}
                    disabled={isLoading || !input.trim()}
                    aria-label="Send dream"
                >
                    <PaperPlaneIcon className="w-6 h-6 text-white" />
                </button>
            </form>
        </div>
      )}
       <RecordDreamModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSend={(dreamText, detectedMood) => {
          setIsRecordModalOpen(false);
          handleSendDream(dreamText, detectedMood);
        }}
        isNightMode={isNightMode}
      />
      <UploadDreamModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSend={(dreamText, detectedMood) => {
            setIsUploadModalOpen(false);
            handleSendDream(dreamText, detectedMood);
        }}
        isNightMode={isNightMode}
      />
       {animationsEnabled && <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes toast-in-out {
            0% { transform: translateY(-100%) translateX(-50%); opacity: 0; }
            10% { transform: translateY(0) translateX(-50%); opacity: 1; }
            90% { transform: translateY(0) translateX(-50%); opacity: 1; }
            100% { transform: translateY(-100%) translateX(-50%); opacity: 0; }
        }
        .animate-toast-in-out {
            animation: toast-in-out 3s ease-in-out forwards;
        }
        @keyframes idle-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
        .animate-idle-bob {
            animation: idle-bob 2.5s ease-in-out infinite;
        }
        
        /* IMPROVED: Bubble animation for smoother entry */
        @keyframes bubble-in {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-bubble-in {
            animation: bubble-in 0.4s ease-out forwards;
        }

        /* IMPROVED: Avatar pulse for a more subtle loading indicator */
        @keyframes avatar-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
        }
        .animate-avatar-pulse {
            animation: avatar-pulse 1.8s infinite ease-in-out;
        }
        
        /* IMPROVED: Typing indicator with a fade effect instead of bounce */
        .typing-indicator {
            display: flex;
            align-items: center;
            height: 100%;
            padding: 3px 0;
        }
        .typing-indicator span {
            height: 8px;
            width: 8px;
            background-color: currentColor;
            border-radius: 50%;
            display: inline-block;
            margin: 0 2px; /* Increased spacing slightly */
            animation: typing-fade 1.5s infinite ease-in-out both;
        }
        .typing-indicator span:nth-of-type(1) { animation-delay: 0s; }
        .typing-indicator span:nth-of-type(2) { animation-delay: 0.25s; }
        .typing-indicator span:nth-of-type(3) { animation-delay: 0.5s; }
        @keyframes typing-fade {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }
      `}</style>}
    </div>
  );
};
