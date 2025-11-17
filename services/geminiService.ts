
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Message } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.warn("API_KEY environment variable not set. Using fallback.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY || ' ' });

export const getChatStream = async (history: Message[], newMessage: Message) => {
    const chatHistory = history.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => {
            if (part.text) {
                return { text: part.text };
            }
            if (part.inlineData) {
                return {
                    inlineData: {
                        mimeType: part.inlineData.mimeType,
                        data: part.inlineData.data
                    }
                };
            }
            return { text: '' };
        })
    }));

    const contents = [...chatHistory, { role: newMessage.role, parts: newMessage.parts }];

    try {
        // FIX: Use the recommended `ai.models.generateContentStream` method with the model name passed directly.
        // The previous method of getting a model instance first is deprecated.
        const result = await ai.models.generateContentStream({ model: 'gemini-2.5-flash', contents });
        return result;
    } catch (error) {
        console.error("Error getting chat stream:", error);
        throw error;
    }
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string[]> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });

        return response.generatedImages.map(img => img.image.imageBytes);
    } catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
};

export const analyzeFileContent = async (fileContent: string, prompt: string) => {
    const fullPrompt = `
      Document Content:
      ---
      ${fileContent}
      ---

      User's question:
      ${prompt}
    `;

    try {
        // FIX: Use the recommended `ai.models.generateContentStream` method with the model name passed directly.
        // The previous method of getting a model instance first is deprecated.
        const result = await ai.models.generateContentStream({ model: 'gemini-2.5-flash', contents: [{ role: 'user', parts: [{ text: fullPrompt }] }] });
        return result;
    } catch (error) {
        console.error("Error analyzing file content:", error);
        throw error;
    }
};
