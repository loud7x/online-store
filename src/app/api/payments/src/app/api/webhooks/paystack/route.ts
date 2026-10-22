
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      received: true,
      ignored: true,
      message: "LOUDEFOOT online payments are disabled.",
    },
    { status: 200 }
  );
}
