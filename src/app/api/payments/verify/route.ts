
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Online payment verification is disabled because LOUDEFOOT uses direct deals between buyers and sellers.",
    },
    { status: 410 }
  );
}
