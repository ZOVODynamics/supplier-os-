import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const userId = session.user.id;
    const role = session.user.role;

    const where: Record<string, unknown> = {};

    // Filter by role
    if (role === "company") {
      where.userId = userId;
    }
    // Admins and suppliers can see all

    // Filter by status
    if (status && status !== "all") {
      where.status = status;
    }

    // Filter by category
    if (category && category !== "all") {
      where.category = category;
    }

    const requests = await prisma.request.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        matches: {
          include: {
            supplier: { select: { id: true, name: true, rating: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "supplier") {
      return NextResponse.json(
        { error: "Suppliers cannot create requests" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, category, budget, priority, deadline } = body;

    if (!title || !description || !category || !budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newRequest = await prisma.request.create({
      data: {
        title,
        description,
        category,
        budget: parseFloat(budget),
        priority: priority || "medium",
        deadline: deadline ? new Date(deadline) : null,
        userId: session.user.id,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
