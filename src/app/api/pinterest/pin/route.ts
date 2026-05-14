import { NextRequest } from "next/server";
import { createPin } from "@/lib/pinterest";

export async function POST(request: NextRequest) {
  const accessToken = request.headers.get("x-pinterest-token");

  if (!accessToken) {
    return Response.json({ error: "Pinterest access token required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { boardId, title, description, link, imageBase64, imageUrl, altText } = body;

    if (!boardId) {
      return Response.json({ error: "Board ID is required" }, { status: 400 });
    }

    if (!title) {
      return Response.json({ error: "Pin title is required" }, { status: 400 });
    }

    if (!imageBase64 && !imageUrl) {
      return Response.json({ error: "Image (base64 or URL) is required" }, { status: 400 });
    }

    const pin = await createPin(accessToken, {
      boardId,
      title,
      description: description || "",
      link,
      imageBase64,
      imageUrl,
      altText,
    });

    return Response.json({ pin });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create pin";
    return Response.json({ error: message }, { status: 500 });
  }
}
