import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateText } from "ai";
import { minimax } from "vercel-minimax-ai-provider";
import { z } from "zod";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const minimaxModel = minimax("abab6.5s-chat");

interface ScreenData {
  name: string;
  description: string;
  htmlContent: string;
  cssContent: string;
}

/**
 * Safely extract JSON from various response formats
 */
function extractJSON(text: string): ScreenData | null {
  // Pattern 1: Direct JSON object
  try {
    return JSON.parse(text);
  } catch {
    /* continue */
  }

  // Pattern 2: JSON in code blocks (```json or ```)
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {
      /* continue */
    }
  }

  // Pattern 3: JSON object anywhere in text (find first { and last })
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      /* continue */
    }
  }

  // Pattern 4: Look for specific fields in text
  const nameMatch = text.match(/"name"\s*:\s*"([^"]*)"/);
  const htmlMatch = text.match(
    /"htmlContent"\s*:\s*"([\s\S]*?)"(?:,\s*"|\s*})/,
  );
  const descMatch = text.match(/"description"\s*:\s*"([^"]*)"/);
  const cssMatch = text.match(/"cssContent"\s*:\s*"([^"]*)"/);

  if (nameMatch && htmlMatch) {
    return {
      name: nameMatch[1],
      description: descMatch ? descMatch[1] : "",
      htmlContent: htmlMatch[1],
      cssContent: cssMatch ? cssMatch[1] : "",
    };
  }

  return null;
}

/**
 * Generate screen data using Minimax AI
 */
async function generateScreenData(
  prompt: string,
  systemPrompt: string,
): Promise<ScreenData> {
  const fullPrompt = `${systemPrompt}

${prompt}

IMPORTANT: You must respond with ONLY a JSON object in this exact format:
{"name": "Screen Name", "description": "Brief description", "htmlContent": "<complete html code with tailwind classes>", "cssContent": ""}

Do NOT include markdown code blocks, explanations, or any other text. Just return the JSON object.`;

  try {
    const { text } = await generateText({
      model: minimaxModel,
      prompt: fullPrompt,
    });

    const parsed = extractJSON(text);
    if (parsed) {
      // Sanitize the HTML content
      return {
        name: parsed.name || "Generated Screen",
        description: parsed.description || "",
        htmlContent: parsed.htmlContent || generateFallbackHTML(prompt),
        cssContent: parsed.cssContent || "",
      };
    }

    // Last resort: try to extract HTML directly
    const htmlOnly = text.match(/<[\s\S]*>/g);
    if (htmlOnly) {
      return {
        name: "Generated Screen",
        description: "Generated from AI response",
        htmlContent: htmlOnly.slice(0, 5).join("\n"),
        cssContent: "",
      };
    }

    throw new Error("Could not parse AI response as JSON");
  } catch (e) {
    console.error("[Generate] Minimax failed:", e);
    // Return fallback instead of throwing
    return {
      name: "Generated Screen",
      description: "Generated from prompt",
      htmlContent: generateFallbackHTML(prompt),
      cssContent: "",
    };
  }
}

/**
 * Generate a simple fallback HTML when AI fails
 */
function generateFallbackHTML(userPrompt: string): string {
  const safePrompt =
    userPrompt.length > 100 ? userPrompt.slice(0, 100) + "..." : userPrompt;

  return `<div class="min-h-screen bg-gray-50 p-6">
  <div class="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
    <div class="bg-indigo-600 px-6 py-4">
      <h1 class="text-white text-xl font-bold">Generated Screen</h1>
    </div>
    <div class="p-6">
      <p class="text-gray-600 mb-4">Your request: "${safePrompt}"</p>
      <div class="bg-gray-100 rounded-xl p-4 text-center">
        <p class="text-gray-500 text-sm">AI-generated content will appear here</p>
      </div>
      <button class="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
        Action Button
      </button>
    </div>
  </div>
</div>`;
}

const generateBodySchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  prompt: z.string().min(1, "Prompt is required"),
  screenId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // Apply rate limiting for AI generation endpoint (strict: 10 req/min)
  const rateLimitResponse = rateLimit(RATE_LIMITS.strict)(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = generateBodySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { projectId, prompt, screenId } = validation.data;

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const systemPrompt = `
      You are an expert mobile app UI designer.
      Generate a beautiful, modern mobile screen design.

      Requirements:
      - Use Tailwind CSS for all styling
      - Mobile width: 375px
      - Modern UI: rounded corners, soft shadows, ample whitespace
      - Good contrast and accessibility
    `;

    const screenData = await generateScreenData(
      `Project: ${project.name}\nRequest: ${prompt}`,
      systemPrompt,
    );

    // Handle update or create
    let screen;
    if (screenId) {
      screen = await prisma.screen.update({
        where: { id: screenId },
        data: {
          name: screenData.name,
          htmlContent: screenData.htmlContent,
          cssContent: screenData.cssContent,
          updatedAt: new Date(),
        },
      });
    } else {
      screen = await prisma.screen.create({
        data: {
          projectId,
          name: screenData.name,
          htmlContent: screenData.htmlContent,
          cssContent: screenData.cssContent,
          width: 375,
          height: 812,
        },
      });
    }

    // Log the prompt
    await prisma.promptHistory.create({
      data: {
        projectId,
        content: prompt,
        role: "user",
      },
    });

    return NextResponse.json({
      screen,
      fallback: screenData.name === "Generated Screen" ? true : undefined,
    });
  } catch (error) {
    console.error("[Generate] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate screen" },
      { status: 500 },
    );
  }
}
