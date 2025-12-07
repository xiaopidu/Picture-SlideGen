import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SlideContent } from "../types";
import { fileToBase64 } from "./utils";

// Define the schema for the output
const slideSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A professional and catchy title for the slide based on the image.",
    },
    points: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "3 short, concise bullet points summarizing the visual content or context of the image.",
    },
  },
  required: ["title", "points"],
};

export const analyzeImage = async (file: File): Promise<SlideContent> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = await fileToBase64(file);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          },
          {
            text: "Analyze this image and provide content for a PowerPoint slide. Keep it professional and concise.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: slideSchema,
        systemInstruction: "You are an expert presentation designer. Your goal is to extract meaningful content from images to create high-quality slides.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text) as SlideContent;
    return data;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback in case of error, so the slide still works
    return {
      title: "Slide Image",
      points: ["Image analysis failed", "Visual content included"],
    };
  }
};