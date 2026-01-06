import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";

const raffleId = "raffle_1"; // তোমার রাফেল আইডি

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, txHash } = body;

    if (!address || !txHash) {
      return NextResponse.json(
        { error: "Missing address or txHash" },
        { status: 400 }
      );
    }

    // Check if raffle exists
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    });
    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 });
    }

    // Check if max entries reached
    if (raffle.entriesCount >= raffle.maxEntries) {
      return NextResponse.json({ error: "Raffle is full" }, { status: 400 });
    }

    // Check if user already entered
    const existingEntry = await prisma.raffleEntry.findUnique({
      where: {
        address_raffleId: {
          address,
          raffleId,
        },
      },
    });
    if (existingEntry) {
      return NextResponse.json(
        { error: "User already entered" },
        { status: 400 }
      );
    }

    // Create entry
    await prisma.raffleEntry.create({
      data: {
        address,
        txHash,
        raffleId,
      },
    });

    // Update raffle entries count atomically
    await prisma.raffle.update({
      where: { id: raffleId },
      data: {
        entriesCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ message: "Entry successful" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
