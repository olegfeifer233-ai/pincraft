import { NextRequest } from "next/server";
import { exchangeCodeForToken } from "@/lib/pinterest";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, app_id, app_secret, redirect_uri } = body;

  if (!code || !app_id || !app_secret || !redirect_uri) {
    return Response.json(
      { error: "Missing required fields: code, app_id, app_secret, redirect_uri" },
      { status: 400 }
    );
  }

  try {
    const tokens = await exchangeCodeForToken(code, redirect_uri, app_id, app_secret);

    return Response.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      expires_at: Date.now() + tokens.expires_in * 1000,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Token exchange failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
