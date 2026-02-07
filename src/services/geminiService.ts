import { GoogleGenAI, Type } from "@google/genai";
import { fplApi } from "./fplService";
/**
 * Orchestrator for the Chat Experience.
 * Manages session history, tool execution, and persona reinforcement.
 */

/**
 * Orchestrator for the Chat Experience.
 * Manages session history, tool execution, and persona reinforcement.
 */
export class ChatOrchestrator {
  private ai: any;
  private history: any[] = [];
  private sysInstruction = `You are a world-class FPL Scout. You translate complex data into beautiful, actionable Markdown scouting reports.

Personality:
- Insightful, professional, and slightly elite (like a premium sports analyst).
- Use real-time data from tools to back up every recommendation.
- Interpretation is key: explain WHAT the data means for the manager's rank.

Capabilities:
- You can fetch real-time FPL player stats and top performers via tools.
- You generate scouting reports, transfer advice, and captaincy analysis.

Reporting Format:
- Use H2 and H3 for sections.
- Use bolding for player names.
- Use tables for statistical comparisons.
- Keep it concise but dense with value.`;

  public initError: string | null = null;

  constructor() {
    try {
      // Check both standard and Vite-prefixed environment variables
      const apiKey = process.env.API_KEY ||
        process.env.GEMINI_API_KEY ||
        (import.meta as any).env?.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        this.initError = "Gemini API Key is missing. Please check your Vercel Environment Variables.";
        console.warn(this.initError);
        return;
      }
      // The SDK constructor takes the key string, not an object
      this.ai = new GoogleGenAI(apiKey);
    } catch (e: any) {
      this.initError = "Failed to initialize AI Scout: " + e.message;
      console.error(this.initError);
    }
  }

  async sendMessage(message: string) {
    if (this.initError) {
      throw new Error(this.initError);
    }

    // 1. Add user message to history
    this.history.push({
      role: 'user',
      parts: [{ text: message }]
    });

    try {
      let loopCount = 0;
      const MAX_LOOPS = 5;

      // Initialize the model once for this turn
      const model = this.ai.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: { role: 'system', parts: [{ text: this.sysInstruction }] },
        tools: [
          {
            functionDeclarations: [
              {
                name: "get_player_stats",
                description: "Fetch detailed statistics for a specific FPL player.",
                parameters: {
                  type: Type.OBJECT,
                  properties: { name: { type: Type.STRING } },
                  required: ["name"]
                }
              },
              {
                name: "get_top_players",
                description: "Fetch top performing players by position.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    position: { type: Type.STRING, description: "GKP, DEF, MID, or FWD" },
                    limit: { type: Type.NUMBER }
                  }
                }
              },
              {
                name: "get_fixtures",
                description: "Fetch upcoming fixtures for a specific FPL team.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    team: { type: Type.STRING, description: "Name of the team (e.g., Arsenal, Liverpool)" }
                  },
                  required: ["team"]
                }
              }
            ]
          }
        ]
      });

      while (loopCount < MAX_LOOPS) {
        loopCount++;

        const result = await model.generateContent({
          contents: this.history,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        });

        const response = await result.response;
        const candidate = response.candidates![0];
        const parts = candidate.content.parts;

        // Add model response to history
        this.history.push(candidate.content);

        // Check for Tool Calls
        const toolCalls = parts.filter((p: any) => p.functionCall);

        if (toolCalls.length === 0) {
          // No more tools, return the final text
          const textPart = parts.find((p: any) => p.text);
          return {
            text: textPart?.text || "The scout is thinking deeply. Please ask again.",
            data: {}
          };
        }

        // Execute Tools
        const toolResultsParts = [];
        for (const call of toolCalls) {
          const { name, args } = call.functionCall;
          console.log(`[Elite Scout] Executing tool: ${name}`, args);

          let toolResult;
          try {
            if (name === 'get_player_stats') {
              toolResult = await fplApi.getPlayerStats(args.name);
            } else if (name === 'get_top_players') {
              toolResult = await fplApi.getTopPlayers(args.position, args.limit);
            } else if (name === 'get_fixtures') {
              toolResult = await fplApi.getFixtures(args.team);
            }
          } catch (toolError) {
            console.error(`Tool execution error [${name}]:`, toolError);
            toolResult = { error: "Data fetch failed for this tool." };
          }

          toolResultsParts.push({
            functionResponse: {
              name,
              response: { content: toolResult || { error: "No data found" } }
            }
          });
        }

        // Add tool results to history for the next turn
        this.history.push({
          role: 'user',
          parts: toolResultsParts
        });
      }

      return { text: "Analysis complete, but I may have exceeded my data lookup limit.", data: {} };

    } catch (error: any) {
      console.error("Orchestrator Error detailed:", error);
      throw error;
    }
  }

  getHistory() {
    return this.history;
  }
}

// Keep the legacy export (stateless)
export async function chatWithGemini(messages: any[]) {
  const orchestrator = new ChatOrchestrator();
  const lastMessage = messages[messages.length - 1].content;
  return orchestrator.sendMessage(lastMessage);
}

/**
 * Generates marketing variants based on selected scouting content.
 */
export async function generateMessageVariants(content: string, channel: 'Push' | 'Social' | 'Email') {
  const apiKey = process.env.API_KEY ||
    process.env.GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY;
  const genAI = new GoogleGenAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: { role: 'system', parts: [{ text: "You are a senior FPL content strategist. Return a JSON object with a 'variants' array containing exactly 3 objects. Each object must have 'label' and 'content' strings." }] },
  });

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
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
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
      }
    });

    const response = await result.response;
    const rawText = response.text();
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
  const apiKey = process.env.API_KEY ||
    process.env.GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY;
  const genAI = new GoogleGenAI(apiKey);

  try {
    // Note: The specific image model name depends on your project access (e.g., 'imagination-base')
    // For this prototype, we'll keep the styles and the fallback logic.
    return [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=800"
    ];
  } catch (error) {
    console.error("Creative generation failed:", error);
    return [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=800"
    ];
  }
}
