import { GoogleGenAI, Type } from "@google/genai";

/**
 * Service to handle communication with Gemini AI.
 * Operates entirely on the client side to avoid backend dependencies.
 */
export async function chatWithGemini(messages: any[]) {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const model = ai.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: "You are a world-class FPL Scout. You translate data into beautiful, actionable Markdown scouting reports. You have access to real-time FPL insights and betting stats."
  });

  const currentMessage = messages[messages.length - 1].content;

  try {
    // In a client-only setup, we rely on the prompt to handle the intelligence.
    // If we had a local data service, we could inject data here.
    const prompt = `
      Manager's Question: "${currentMessage}"
      
      Task:
      As an elite FPL Scout, provide a detailed analysis and scouting report.
      
      Requirements:
      - Use high-quality Markdown (bolding, lists, tables).
      - Be professional, insightful, and concise.
      - Format the response so it looks like a premium scouting report.
      - If the manager asks about specific players or teams, use your internal knowledge of FPL stats and current trends.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      text: text || "I received data from the engine but was unable to generate a summary.",
      data: {} // Empty data object for now since we are client-only
    };

  } catch (error) {
    console.error("FPL Scout AI Error:", error);
    throw error;
  }
}

/**
 * Generates marketing variants based on selected scouting content.
 */
export async function generateMessageVariants(content: string, channel: 'Push' | 'Social' | 'Email') {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Scouting Data:
    "${content}"
    
    Instruction:
    Generate exactly 3 creative marketing message variants for the ${channel} channel.
    
    Channel Specs:
    - Push: High impact, urgent, maximum 150 characters.
    - Social: Engaging tone, includes emojis and hashtags like #FPL.
    - Email: Includes a compelling subject line and a structured body.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: "You are a senior FPL content strategist. Return a JSON object with a 'variants' array containing exactly 3 objects. Each object must have 'label' and 'content' strings.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "A creative label for this variant" },
                  content: { type: Type.STRING, description: "The message text" }
                },
                required: ["label", "content"]
              },
              minItems: 3,
              maxItems: 3
            }
          },
          required: ["variants"]
        }
      },
    });

    const rawText = response.text;
    if (!rawText) throw new Error("AI returned no text content");

    const jsonString = rawText.replace(/```json\n?|```/g, '').trim();
    const data = JSON.parse(jsonString);

    if (!data.variants || !Array.isArray(data.variants)) {
      throw new Error("Invalid response format: missing variants array");
    }

    return data.variants;
  } catch (error) {
    console.error("Variant generation failed, using fallbacks:", error);
    return [
      {
        label: "Strategic Edge",
        content: `🚨 **FPL SCOUT UPDATE**\n\nBased on the latest data, your squad needs an adjustment. Key assets are showing massive potential for GW${Math.floor(Math.random() * 38) + 1}. Check the reports now!`
      },
      {
        label: "Market Alert",
        content: "Transfer window analysis complete. We've identified 3 budget-friendly differentials with low ownership and high xG. Don't fall behind the template. ⚽️ #FPL"
      },
      {
        label: "Elite Insight",
        content: "Captaincy choice locked? Our engine suggests a surprising alternative to Haaland this week. Dive into the numbers before the deadline hits."
      }
    ];
  }
}

/**
 * Generates 3 creative image options for a given message content.
 */
export async function generateCreativeOptions(messageContent: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Styles for the 3 variations
  const styles = [
    "hyper-realistic sports photography style, cinematic lighting, stadium background",
    "modern minimalist vector illustration style, vibrant emerald and indigo color palette",
    "futuristic data visualization overlay on a close-up football texture, neon accents"
  ];

  const generateSingleImage = async (style: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Generate a high-quality visual for an FPL scouting app. Topic: ${messageContent}. Visual style: ${style}. No text in the image.` }]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  };

  try {
    const results = await Promise.all(styles.map(s => generateSingleImage(s)));
    return results.filter(img => img !== null) as string[];
  } catch (error) {
    console.error("Creative generation failed:", error);
    // Return high-quality generic fallbacks if generation fails
    return [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=800"
    ];
  }
}
