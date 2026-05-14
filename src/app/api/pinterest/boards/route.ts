import { NextRequest } from "next/server";
import { listBoards, createBoard } from "@/lib/pinterest";

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get("x-pinterest-token");

  if (!accessToken) {
    return Response.json({ error: "Pinterest access token required" }, { status: 401 });
  }

  try {
    const boards = await listBoards(accessToken);
    return Response.json({ boards });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch boards";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const accessToken = request.headers.get("x-pinterest-token");

  if (!accessToken) {
    return Response.json({ error: "Pinterest access token required" }, { status: 401 });
  }

  try {
    const { name, description } = await request.json();

    if (!name) {
      return Response.json({ error: "Board name is required" }, { status: 400 });
    }

    const board = await createBoard(accessToken, name, description || "");
    return Response.json({ board });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create board";
    return Response.json({ error: message }, { status: 500 });
  }
}
