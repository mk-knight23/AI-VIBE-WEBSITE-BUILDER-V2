import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// Schema for PATCH endpoint - whitelist allowed fields only
const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  thumbnail: z.string().url().optional(),
  updatedAt: z.date().optional(),
});

// GET /api/projects/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Apply rate limiting (lenient: 100 req/min)
  const rateLimitResponse = rateLimit(RATE_LIMITS.lenient)(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { screens: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

// PATCH /api/projects/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Apply rate limiting (moderate: 30 req/min)
  const rateLimitResponse = rateLimit(RATE_LIMITS.moderate)(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Check ownership
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject || existingProject.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Validate and whitelist allowed fields
    const validation = updateProjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Only update validated fields
    const updateData: { name?: string; thumbnail?: string; updatedAt?: Date } =
      {};
    if (validation.data.name !== undefined)
      updateData.name = validation.data.name;
    if (validation.data.thumbnail !== undefined)
      updateData.thumbnail = validation.data.thumbnail;
    if (validation.data.updatedAt !== undefined)
      updateData.updatedAt = validation.data.updatedAt;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

// DELETE /api/projects/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Apply rate limiting (moderate: 30 req/min)
  const rateLimitResponse = rateLimit(RATE_LIMITS.moderate)(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject || existingProject.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
