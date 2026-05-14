import { NextRequest } from "next/server";
import { getUserAccount } from "@/lib/pinterest";

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get("x-pinterest-token");

  if (!accessToken) {
    return Response.json({ error: "Pinterest access token required" }, { status: 401 });
  }

  try {
    const user = await getUserAccount(accessToken);
    return Response.json({ user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch user";
    return Response.json({ error: message }, { status: 500 });
  }
}
