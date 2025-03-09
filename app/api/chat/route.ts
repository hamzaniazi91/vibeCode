// app/api/chat/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { message, user_id } = await request.json();
  
  // Example: Echo back the message (replace with real logic)
  return NextResponse.json({
    status: "success",
    response: `You said: "${message}"`,
  });
}
