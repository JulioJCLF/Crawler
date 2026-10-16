import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, findUserByIdentifier, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(sessionToken);

  if (!session) {
    return NextResponse.json({
      authenticated: false,
    });
  }

  const user = findUserByIdentifier(session.username);

  return NextResponse.json({
    authenticated: true,
    user: {
      username: session.username,
      email: user?.email || "",
      role: session.role,
    },
  });
}
