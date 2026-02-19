import { generateText } from "ai";
import { z } from "zod";
import { NextResponse, type NextRequest } from "next/server";
import { minimax } from "vercel-minimax-ai-provider";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const maxDuration = 60;

const minimaxModel = minimax("abab6.5s-chat");

interface ChatMessage {
  role: string;
  content: string;
}

/**
 * Generate a chat response using Minimax AI
 */
async function generateResponse(
  messages: ChatMessage[],
  projectId?: string,
): Promise<string> {
  // Build conversation context
  const conversationHistory = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const context = projectId ? `Current project ID: ${projectId}` : "";

  const systemPrompt = `You are an AI mobile UI design assistant.
${context}

You help users design mobile app interfaces using Tailwind CSS.
Keep responses helpful, concise, and actionable.
Respond in plain text without markdown formatting.`;

  const fullPrompt = `${systemPrompt}

${conversationHistory}
assistant:`;

  try {
    const { text } = await generateText({
      model: minimaxModel,
      prompt: fullPrompt,
    });

    // Clean up response - remove any markdown
    return text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .trim();
  } catch (e) {
    console.error("[Chat] Minimax failed:", e);
    throw new Error("AI service temporarily unavailable");
  }
}

const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      }),
    )
    .min(1, "Messages are required"),
  projectId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // Apply rate limiting for AI chat endpoint (strict: 10 req/min)
  const rateLimitResponse = rateLimit(RATE_LIMITS.strict)(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();
    const validation = chatBodySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { messages, projectId } = validation.data;

    const text = await generateResponse(messages, projectId);

    return NextResponse.json({ text });
  } catch (error) {
    console.error("[Chat] Error:", error);

    return NextResponse.json(
      {
        text: "I'm having trouble connecting right now. Please try again in a moment.",
      },
      { status: 200 }, // Return 200 so UI shows the fallback message
    );
  }
}
