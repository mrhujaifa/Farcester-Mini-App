import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[raffle/enter] Request body:", body);

    const { address, txHash } = body;

    if (!address || !txHash) {
      console.log("[raffle/enter] Missing address or txHash");
      return NextResponse.json(
        { error: "Missing address or txHash" },
        { status: 400 }
      );
    }

    // ডাটাবেজ থেকে প্রথম রাফেল (বা প্রয়োজনমত রাফেল) নিয়ে আসো
    let raffle = await prisma.raffle.findFirst();
    if (!raffle) {
      // যদি রাফেল না থাকে, তাহলে নতুন রাফেল তৈরি করো
      raffle = await prisma.raffle.create({
        data: {}, // এখানে প্রয়োজনমতো ডিফল্ট মান দিতে পারো
      });
    }
    const raffleId = raffle.id;
    console.log("[raffle/enter] Raffle found:", raffle);

    // Check if max entries reached
    if (raffle.entriesCount >= raffle.maxEntries) {
      console.log("[raffle/enter] Raffle full");
      return NextResponse.json(
        {
          error: "Sorry, the event has reached its maximum number of entries.",
        },
        { status: 400 }
      );
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
    console.log("[raffle/enter] Existing entry:", existingEntry);

    if (existingEntry) {
      console.log("[raffle/enter] User already entered");
      return NextResponse.json(
        { error: "You Already Joined this event!" },
        { status: 400 }
      );
    }

    // Check if txHash already used
    const existingTxHash = await prisma.raffleEntry.findUnique({
      where: {
        txHash,
      },
    });
    if (existingTxHash) {
      console.log("[raffle/enter] TxHash already used");
      return NextResponse.json(
        { error: "Transaction already recorded" },
        { status: 400 }
      );
    }

    // Create new raffle entry
    const newEntry = await prisma.raffleEntry.create({
      data: {
        address,
        txHash,
        raffleId,
      },
    });
    console.log("[raffle/enter] New entry created:", newEntry);

    // Increment entries count atomically
    const updatedRaffle = await prisma.raffle.update({
      where: { id: raffleId },
      data: {
        entriesCount: {
          increment: 1,
        },
      },
    });
    console.log("[raffle/enter] Raffle updated:", updatedRaffle);

    return NextResponse.json({
      message: "Congratulations! You have successfully joined the event.",
    });
  } catch (error) {
    console.error("[raffle/enter] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const address = searchParams.get("address") || "";

//     // প্রথম রাফেল নাও (ডাটাবেজে একাধিক রাফেল থাকলে প্রয়োজনমত filter করে নিতে পারো)
//     const raffle = await prisma.raffle.findFirst();

//     if (!raffle) {
//       return NextResponse.json({ error: "No raffle found" }, { status: 404 });
//     }

//     // চেক করো ইউজার ইতিমধ্যে এন্ট্রি দিয়েছে কিনা
//     let hasUserEntered = false;
//     if (address) {
//       const entry = await prisma.raffleEntry.findUnique({
//         where: {
//           address_raffleId: {
//             address,
//             raffleId: raffle.id,
//           },
//         },
//       });
//       hasUserEntered = !!entry;
//     }

//     return NextResponse.json({
//       id: raffle.id,
//       entriesCount: raffle.entriesCount,
//       maxEntries: raffle.maxEntries,
//       hasUserEntered,
//     });
//   } catch (error) {
//     console.error("[raffle/state] Error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

export async function GET() {
  try {
    const entries = await prisma.raffleEntry.findMany({
      select: {
        id: true,
        address: true,
        txHash: true,
        createdAt: true,
        raffleId: true,
      },
    });

    const totalCount = entries.length;

    return NextResponse.json({
      totalCount,
      entries,
    });
  } catch (error) {
    console.error("[raffle/entries] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
