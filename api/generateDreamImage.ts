import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt } = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const artisticPrompt = `A dreamlike, ethereal, and surreal digital painting of: ${prompt}. Use a soft, glowing color palette.`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: artisticPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

        res.status(200).json({ imageUrl });

    } catch (error) {
        console.error("Error in generateDreamImage API:", error);
        res.status(500).json({ error: "Failed to generate dream image." });
    }
}
