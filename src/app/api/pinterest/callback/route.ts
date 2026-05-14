import { NextRequest } from "next/server";
import { exchangeCodeForToken } from "@/lib/pinterest";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code) {
    return new Response(callbackHtml("error", "No authorization code received"), {
      headers: { "Content-Type": "text/html" },
    });
  }

  const appId = process.env.PINTEREST_APP_ID;
  const appSecret = process.env.PINTEREST_APP_SECRET;

  if (!appId || !appSecret) {
    return new Response(
      callbackHtml("error", "Pinterest App ID/Secret not configured on server"),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/pinterest/callback`;

  try {
    const tokens = await exchangeCodeForToken(code, redirectUri, appId, appSecret);

    return new Response(
      callbackHtml("success", JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        expires_at: Date.now() + tokens.expires_in * 1000,
        state,
      })),
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Token exchange failed";
    return new Response(callbackHtml("error", message), {
      headers: { "Content-Type": "text/html" },
    });
  }
}

function callbackHtml(status: "success" | "error", data: string): string {
  return `<!DOCTYPE html>
<html>
<head><title>PinCraft — Pinterest</title></head>
<body>
<script>
  try {
    const status = "${status}";
    const data = ${status === "success" ? data : `"${data.replace(/"/g, '\\"')}"`};
    if (status === "success") {
      localStorage.setItem("pincraft_pinterest", JSON.stringify(data));
    }
    if (window.opener) {
      window.opener.postMessage({ type: "pinterest_auth", status, data }, window.location.origin);
      window.close();
    } else {
      window.location.href = "/settings?pinterest=" + status;
    }
  } catch(e) {
    document.body.textContent = "Error: " + e.message;
  }
</script>
<p>Redirecting...</p>
</body>
</html>`;
}
