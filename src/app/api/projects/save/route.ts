import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, name, screens, thumbnail } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID required" },
        { status: 400 },
      );
    }

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name }),
        ...(thumbnail && { thumbnail }),
        updatedAt: new Date(),
      },
    });

    // Update screens if provided
    if (screens && Array.isArray(screens)) {
      for (const screen of screens) {
        if (screen.id) {
          await prisma.screen.update({
            where: { id: screen.id },
            data: {
              x: screen.x,
              y: screen.y,
              width: screen.width,
              height: screen.height,
              name: screen.name,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: "Project saved successfully",
    });
  } catch (error) {
    console.error("Error saving project:", error);
    return NextResponse.json(
      { error: "Failed to save project" },
      { status: 500 },
    );
  }
}
