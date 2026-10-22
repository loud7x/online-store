
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Online payments are unavailable. Please contact the account seller to arrange your deal directly.",
    },
    { status: 410 }
  );
}
