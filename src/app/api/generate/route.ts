import { NextRequest } from "next/server";
import { callAI, AIProvider } from "@/lib/ai";
import { buildGeneratePrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, keywords, language = "ru", apiKey, provider } = body as {
      topic: string;
      keywords: string[];
      language?: string;
      apiKey?: string;
      provider?: AIProvider;
    };

    if (!topic || !keywords || keywords.length === 0) {
      return Response.json(
        { error: "Topic and keywords are required" },
        { status: 400 }
      );
    }

    const prompt = buildGeneratePrompt(topic.trim(), keywords, language);
    const raw = await callAI(prompt, { apiKey, provider });

    const jsonStr = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const pinContent = JSON.parse(jsonStr);

    return Response.json({ success: true, pinContent });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Generate error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
