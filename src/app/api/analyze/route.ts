import { NextRequest } from "next/server";
import { callAI, AIProvider } from "@/lib/ai";
import { buildAnalyzePrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, websiteUrl, language = "ru", apiKey, provider } = body as {
      topic: string;
      websiteUrl?: string;
      language?: string;
      apiKey?: string;
      provider?: AIProvider;
    };

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return Response.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const prompt = buildAnalyzePrompt(topic.trim(), language, websiteUrl);
    const raw = await callAI(prompt, { apiKey, provider });

    const jsonStr = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(jsonStr);

    return Response.json({ success: true, analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Analyze error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
