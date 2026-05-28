import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rankSuppliers } from "@/lib/ai-matching";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    // Get the request
    const supplyRequest = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!supplyRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Authorization check
    if (
      session.user.role === "company" &&
      supplyRequest.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all suppliers
    const suppliers = await prisma.supplier.findMany();

    // Run AI matching
    const matchResults = rankSuppliers(supplyRequest, suppliers);

    // Save matches to database
    const savedMatches = [];
    for (const result of matchResults) {
      // Check if match already exists
      const existingMatch = await prisma.match.findUnique({
        where: {
          requestId_supplierId: {
            requestId,
            supplierId: result.supplierId,
          },
        },
      });

      if (!existingMatch) {
        const match = await prisma.match.create({
          data: {
            requestId,
            supplierId: result.supplierId,
            score: result.score,
            notes: result.reasons.join(". "),
            status: "suggested",
          },
          include: {
            supplier: true,
          },
        });
        savedMatches.push(match);
      } else {
        // Update existing match score
        const match = await prisma.match.update({
          where: { id: existingMatch.id },
          data: {
            score: result.score,
            notes: result.reasons.join(". "),
          },
          include: {
            supplier: true,
          },
        });
        savedMatches.push(match);
      }
    }

    // Update request status if matches found
    if (savedMatches.length > 0 && supplyRequest.status === "open") {
      await prisma.request.update({
        where: { id: requestId },
        data: { status: "matched" },
      });
    }

    return NextResponse.json({
      matches: savedMatches,
      count: savedMatches.length,
    });
  } catch (error) {
    console.error("Error running AI matching:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const role = session.user.role;

    const where: Record<string, unknown> = {};

    if (role === "company") {
      where.request = { userId };
    } else if (role === "supplier") {
      const supplier = await prisma.supplier.findUnique({
        where: { userId },
      });
      if (supplier) {
        where.supplierId = supplier.id;
      }
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        request: {
          include: {
            user: { select: { name: true } },
          },
        },
        supplier: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
