import { NextRequest, NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256, encodePacked, parseUnits } from "viem";

export async function POST(request: NextRequest) {
  try {
    const { userAddress, amount } = await request.json();

    if (!userAddress || amount === undefined) {
      return NextResponse.json(
        { error: "Invalid input", isSuccess: false },
        { status: 400 }
      );
    }

    const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
    if (!SERVER_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Server config error", isSuccess: false },
        { status: 500 }
      );
    }

    const account = privateKeyToAccount(SERVER_PRIVATE_KEY as `0x${string}`);
    const contractAddress = "0xb94F9c81176663f8486FF6df2FdD9391d779d3aB";

    // ১. ডেসিমেল ১৮ অনুযায়ী কনভার্ট (যাতে Receive +0 FR না দেখায়)
    const amountInWei = parseUnits(amount.toString(), 18);

    // ২. নন্স তৈরি
    const nonce = BigInt(Date.now());

    // ৩. হ্যাস তৈরি (সিকোয়েন্স ঠিক রাখা হয়েছে)
    const messageHash = keccak256(
      encodePacked(
        ["address", "uint256", "uint256", "address"],
        [
          userAddress as `0x${string}`,
          amountInWei,
          nonce,
          contractAddress as `0x${string}`,
        ]
      )
    );

    // ৪. ইথেরিয়াম প্রিপেক্সসহ সাইন করা (signMessage অটোমেটিক এটি করে)
    const signature = await account.signMessage({
      message: { raw: messageHash },
    });

    return NextResponse.json(
      {
        signature,
        nonce: nonce.toString(),
        isSuccess: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signing error:", error);
    return NextResponse.json(
      { error: "Signing failed", isSuccess: false },
      { status: 500 }
    );
  }
}
