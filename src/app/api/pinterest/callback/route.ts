import { NextRequest } from "next/server";
import { exchangeCodeForToken } from "@/lib/pinterest";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return new Response(callbackHtml("error", "No authorization code received"), {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Try server-side env vars first (for Vercel deployment with env vars)
  const envAppId = process.env.PINTEREST_APP_ID;
  const envAppSecret = process.env.PINTEREST_APP_SECRET;

  if (envAppId && envAppSecret) {
    // Server has credentials — exchange immediately
    const origin = request.nextUrl.origin;
    const redirectUri = `${origin}/api/pinterest/callback`;

    try {
      const tokens = await exchangeCodeForToken(code, redirectUri, envAppId, envAppSecret);
      return new Response(
        callbackHtml("success", JSON.stringify({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          expires_at: Date.now() + tokens.expires_in * 1000,
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

  // No server env vars — render page that reads credentials from localStorage
  // and exchanges via POST /api/pinterest/token
  return new Response(clientSideCallbackHtml(code), {
    headers: { "Content-Type": "text/html" },
  });
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

function clientSideCallbackHtml(code: string): string {
  return `<!DOCTYPE html>
<html>
<head><title>PinCraft — Pinterest</title></head>
<body>
<p id="status">Connecting to Pinterest...</p>
<script>
(async function() {
  try {
    const appId = localStorage.getItem("pincraft_pinterest_app_id");
    const appSecret = localStorage.getItem("pincraft_pinterest_app_secret");

    if (!appId || !appSecret) {
      throw new Error("Pinterest App ID and Secret not found. Please save them in Settings first.");
    }

    const res = await fetch("/api/pinterest/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: ${JSON.stringify(code)},
        app_id: appId,
        app_secret: appSecret,
        redirect_uri: window.location.origin + "/api/pinterest/callback"
      })
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Token exchange failed");
    }

    localStorage.setItem("pincraft_pinterest", JSON.stringify(result));

    if (window.opener) {
      window.opener.postMessage({ type: "pinterest_auth", status: "success", data: result }, window.location.origin);
      window.close();
    } else {
      window.location.href = "/settings?pinterest=success";
    }
  } catch(e) {
    document.getElementById("status").textContent = "Error: " + e.message;
    if (window.opener) {
      window.opener.postMessage({ type: "pinterest_auth", status: "error", data: e.message }, window.location.origin);
    }
  }
})();
</script>
</body>
</html>`;
}
