import { ChatMessage, Mood } from "../types";

// Helper for making secure POST requests to our backend API
async function postApi<T>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'An unknown API error occurred' }));
    console.error(`API error at ${endpoint}:`, errorData);
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}


export const analyzeDream = async (
  messages: ChatMessage[],
  systemInstruction: string,
  detectedEmotion: Mood | null,
  recentMoods: Mood[]
): Promise<string> => {
    const data = await postApi<{ response: string }>('/api/analyzeDream', {
      messages,
      systemInstruction,
      detectedEmotion,
      recentMoods,
    });
    return data.response;
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("File could not be read as a string"));
      }
      // result is "data:audio/webm;base64,...." -> we need to remove the prefix
      const base64data = reader.result.split(',')[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    const audioData = await blobToBase64(audioBlob);
    const data = await postApi<{ transcript: string }>('/api/transcribeAudio', {
        audioData,
        mimeType: audioBlob.type || 'audio/webm',
    });
    return data.transcript;
};

export const getSymbolMeaning = async (symbol: string): Promise<string> => {
    const data = await postApi<{ meaning: string }>('/api/getSymbolMeaning', { symbol });
    return data.meaning;
};

export const generateDreamImage = async (prompt: string): Promise<string> => {
    const data = await postApi<{ imageUrl: string }>('/api/generateDreamImage', { prompt });
    return data.imageUrl;
};