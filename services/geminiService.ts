
import { GoogleGenAI, Type } from "@google/genai";
import { Professional, Location } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIRecommendations = async (
  query: string,
  userLocation: Location,
  availableProfessionals: Professional[]
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze this search query: "${query}"
        User Location: ${userLocation.city}, ${userLocation.province}, ${userLocation.country}
        
        Available Professionals Data (Subset): ${JSON.stringify(availableProfessionals.map(p => ({
          id: p.id,
          name: p.name,
          specialty: p.specialty,
          location: p.location,
          rating: p.rating
        })))}

        Task: Return a JSON list of the top 3 professional IDs that best match the query, prioritizing location first, then specialty, then rating. 
        If no one is in the same city, suggest from the same province or remote.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            reasoning: { type: Type.STRING }
          },
          required: ["recommendedIds"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return { recommendedIds: availableProfessionals.slice(0, 3).map(p => p.id), reasoning: "Fallback matching" };
  }
};

export const generateSmartContractSummary = async (scope: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize this service scope into 3 concise professional bullet points for a contract: ${scope}`,
    });
    return response.text;
  } catch (error) {
    return scope;
  }
};
