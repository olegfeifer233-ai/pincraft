import { NextRequest } from "next/server";
import { buildAuthUrl } from "@/lib/pinterest";

export async function GET(request: NextRequest) {
  const appId = request.nextUrl.searchParams.get("app_id") || process.env.PINTEREST_APP_ID;

  if (!appId) {
    return Response.json(
      { error: "Pinterest App ID not configured. Set PINTEREST_APP_ID or provide app_id." },
      { status: 400 }
    );
  }

  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/pinterest/callback`;
  const state = crypto.randomUUID();

  const authUrl = buildAuthUrl(appId, redirectUri, state);

  return Response.json({ authUrl, state });
}
