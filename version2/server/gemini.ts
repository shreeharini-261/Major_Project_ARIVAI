import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface ChatContext {
  cyclePhase?: string;
  symptoms?: string[];
  cycleDay?: number;
}

const SYSTEM_PROMPT = `You are ARIVAI, a compassionate and knowledgeable AI wellness companion specializing in menstrual health and women's wellness. Your role is to provide supportive, evidence-based guidance while maintaining a warm, understanding tone.

Key responsibilities:
1. Provide personalized advice based on the user's current menstrual phase
2. Offer nutritional recommendations and healthy snack ideas
3. Suggest mindfulness and relaxation techniques
4. Answer questions about reproductive health, PMS, pregnancy, and menopause
5. Track and respond to symptom patterns
6. Provide emotional support during difficult times

Guidelines:
- Be empathetic and non-judgmental
- Use inclusive language
- Provide accurate, science-based information
- Encourage users to consult healthcare providers for medical concerns
- Respect privacy and maintain a safe space for discussion
- Offer practical, actionable advice
- Keep responses concise but helpful (2-4 paragraphs typically)

Current user context will be provided with each message.`;

export async function generateChatResponse(
  userMessage: string,
  context: ChatContext,
  chatHistory: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "I'm currently unavailable. Please check back later when the AI service is configured.";
    }

    const contextInfo = [];
    if (context.cyclePhase) {
      contextInfo.push(`Current cycle phase: ${context.cyclePhase}`);
    }
    if (context.cycleDay) {
      contextInfo.push(`Cycle day: ${context.cycleDay}`);
    }
    if (context.symptoms && context.symptoms.length > 0) {
      contextInfo.push(`Recent symptoms: ${context.symptoms.join(', ')}`);
    }

    const contextString = contextInfo.length > 0 
      ? `\n\nUser Context:\n${contextInfo.join('\n')}` 
      : '';

    const formattedHistory = chatHistory.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const prompt = `${SYSTEM_PROMPT}${contextString}\n\nUser message: ${userMessage}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: prompt }] }
      ],
    });

    return response.text || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error("Gemini API error:", error);
    
    if (error.message?.includes("API key")) {
      return "I'm currently unavailable. The AI service needs to be configured with a valid API key.";
    }
    
    return "I encountered an issue processing your request. Please try again in a moment.";
  }
}

export function getPhaseBasedGreeting(phase: string): string {
  const greetings: Record<string, string> = {
    menstrual: "During your menstrual phase, it's important to rest and be gentle with yourself. I'm here to support you with nutrition tips, relaxation techniques, and answers to any questions you have.",
    follicular: "Welcome to your follicular phase! Your energy is likely rising, making this a great time for new activities. How can I help you make the most of this phase?",
    ovulation: "You're in your ovulation phase - often a time of peak energy and confidence. I'm here to help with any questions about fertility, nutrition, or general wellness.",
    luteal: "During the luteal phase, you might experience some PMS symptoms. I'm here to offer support, recommend soothing recipes, and help you navigate this time with self-compassion.",
  };
  
  return greetings[phase] || "Hello! I'm ARIVAI, your wellness companion. How can I support you today?";
}
