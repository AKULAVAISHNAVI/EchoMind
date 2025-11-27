import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { ChatMessage, Mood, Sender } from '../types';

// This is a serverless function, designed to be deployed to a cloud platform like Vercel.
// It acts as a secure backend to handle requests from the frontend.
// It expects a Next.js-like API route signature (req, res), which is standard for Vercel.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Safely extract data from the request body.
    const { messages, systemInstruction, detectedEmotion, recentMoods } = req.body as {
        messages: ChatMessage[];
        systemInstruction: string;
        detectedEmotion: Mood | null;
        recentMoods: Mood[];
    };
    
    // Initialize the AI SDK on the server, where the API key is securely stored as an environment variable.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Format the message history from our app's format to the format required by the Gemini API.
    const contents = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    // Find the last user message to prepend context to, ensuring we don't modify past conversations.
    const lastUserContent = contents.slice().reverse().find(c => c.role === 'user');

    if (lastUserContent) {
        // We only add the context (voice emotion, mood history) to the very first user message of a new conversation.
        const userMessagesCount = messages.filter(m => m.sender === 'user').length;
        
        if (userMessagesCount === 1) {
            let contextHeader = '';
            if (detectedEmotion) {
                contextHeader += `(System note: The user's voice was analyzed and detected as feeling ${detectedEmotion})\n`;
            }
            if (recentMoods && recentMoods.length > 0) {
                contextHeader += `(System note: User's recent mood history (last 7 days): ${recentMoods.join(', ')})\n`;
            }

            if (contextHeader) {
                lastUserContent.parts[0].text = `${contextHeader}\n${lastUserContent.parts[0].text}`;
            }
        }
    }

    // Call the Gemini API with the formatted content and configuration.
    // OPTIMIZATION: Switched to gemini-2.5-flash for faster response times.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
        },
        // Add safety settings, which is a good practice for a public-facing application.
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
    });

    // Send the successful response back to the frontend.
    res.status(200).json({ response: response.text });

  } catch (error) {
    console.error("Error in analyzeDream API:", error);
    res.status(500).json({ error: "Failed to get response from AI." });
  }
}