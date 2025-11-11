import { NextResponse } from "next/server";
import { generateBracketSkeleton } from "@/lib/bracket/generateSkeleton";

// Helper: Round up to next power of two
function nextPowerOfTwo(n: number) {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

export async function POST(req: Request) {
  try {
    const { format, participants } = await req.json();

    if (!format || !["single_elim", "double_elim"].includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    if (!participants || participants.length < 2) {
      return NextResponse.json({ error: "At least two participants required" }, { status: 400 });
    }

    // 🧩 Pad to nearest power of two
    let padded = [...participants];
    const required = nextPowerOfTwo(participants.length);
    const difference = required - participants.length;

    if (difference > 0) {
      const byes = Array.from({ length: difference }, (_, i) => `BYE ${i + 1}`);
      padded = [...participants, ...byes];
      console.log(`⚙️ Added ${difference} BYEs → Total: ${padded.length}`);
    }

    // 🏗️ Generate bracket skeleton
    const skeleton = generateBracketSkeleton(format, padded);

    // ✅ Automatically mark “BYE” matches as finished
    skeleton.matches = skeleton.matches.map((m: any) => {
      const a = m.opponentA?.label;
      const b = m.opponentB?.label;

      if (a?.startsWith("BYE") && !b?.startsWith("BYE")) {
        m.winner = "B";
        m.finished = true;
      } else if (b?.startsWith("BYE") && !a?.startsWith("BYE")) {
        m.winner = "A";
        m.finished = true;
      }

      return m;
    });

    return NextResponse.json(skeleton, { status: 200 });
  } catch (err: any) {
    console.error("Error generating preview:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
