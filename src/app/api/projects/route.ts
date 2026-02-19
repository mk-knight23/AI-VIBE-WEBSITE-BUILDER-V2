import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateText } from "ai";
import { minimax } from "vercel-minimax-ai-provider";
import { z } from "zod";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const minimaxModel = minimax("abab6.5s-chat");

/**
 * Generate a project name using Minimax AI
 * @param prompt - The user prompt describing the project
 * @returns The generated project name
 */
async function generateProjectName(prompt: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: minimaxModel,
      prompt: `Generate a short, creative name (max 4 words) for a mobile app project described as: "${prompt}". Return ONLY the name, no extra text.`,
    });
    return text;
  } catch (e) {
    console.error("[Projects] Minimax failed:", e);
    return "Untitled Project";
  }
}

const createProjectSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(1000, "Prompt too long"),
});

// POST /api/projects - Create a new project
export async function POST(req: NextRequest) {
  // Apply rate limiting for project creation (moderate: 30 req/min)
  const rateLimitResponse = rateLimit(RATE_LIMITS.moderate)(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { prompt } = validation.data;

    // Generate a project name using Minimax AI
    const projectName = await generateProjectName(prompt);

    const project = await prisma.project.create({
      data: {
        name: projectName.trim() || "Untitled Project",
        userId,
        promptHistory: {
          create: {
            content: prompt,
            role: "user",
          },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[Projects] Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}

// GET /api/projects - List all projects for the current user
export async function GET(req: NextRequest) {
  // Apply rate limiting for listing projects (lenient: 100 req/min)
  const rateLimitResponse = rateLimit(RATE_LIMITS.lenient)(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query params for pagination
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          screens: {
            select: { id: true },
            take: 1,
          },
          _count: {
            select: { screens: true },
          },
        },
      }),
      prisma.project.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + projects.length < total,
      },
    });
  } catch (error) {
    console.error("[Projects] Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}
