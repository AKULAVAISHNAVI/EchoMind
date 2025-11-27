
import { GoogleGenAI } from "@google/genai";

// Config to increase the body size limit for audio files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const { audioData, mimeType } = req.body; // Expect base64 string and mimeType
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Use gemini-2.5-flash for fast, multimodal processing
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
          parts: [
              { inlineData: { mimeType: mimeType, data: audioData } },
              { text: 'Transcribe this audio recording of a person describing their dream. Only provide the transcript text, with no extra commentary.' },
          ]
      },
    });
    
    res.status(200).json({ transcript: response.text });
  } catch (error) {
    console.error("Error in transcribeAudio API:", error);
    res.status(500).json({ error: "Failed to transcribe audio." });
  }
}
