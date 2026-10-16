import { NextResponse } from "next/server";
import { requireDeveloperAuth } from "@/lib/server/dev-auth";

export async function GET() {
  const auth = await requireDeveloperAuth();

  if (!auth.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    email: auth.email,
    role: "DEVELOPPEUR_ADMIN",
  });
}
