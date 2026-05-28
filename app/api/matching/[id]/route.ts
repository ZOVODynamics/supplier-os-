import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["suggested", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        request: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Authorization
    if (
      session.user.role !== "admin" &&
      match.request.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: { status },
      include: {
        supplier: true,
        request: true,
      },
    });

    // If accepted, update request status to in_progress
    if (status === "accepted" && match.request.status === "matched") {
      await prisma.request.update({
        where: { id: match.requestId },
        data: { status: "in_progress" },
      });
    }

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
