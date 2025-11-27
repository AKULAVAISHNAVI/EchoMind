import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { symbol } = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Briefly explain the potential meaning of this dream symbol in one or two sentences: "${symbol}"`,
        });
        
        res.status(200).json({ meaning: response.text });
    } catch (error) {
        console.error("Error in getSymbolMeaning API:", error);
        res.status(500).json({ error: "Failed to get symbol meaning." });
    }
}