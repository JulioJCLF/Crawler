import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "arsenal-vitrine",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
}
