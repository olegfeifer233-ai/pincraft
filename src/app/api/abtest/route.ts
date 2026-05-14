import { NextRequest } from "next/server";
import { callAI } from "@/lib/ai";
import { buildABTestPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, keywords, language, geminiKey, groqKey } = body as {
      topic: string;
      keywords: string[];
      language: string;
      geminiKey?: string;
      groqKey?: string;
    };

    if (!topic || !keywords?.length) {
      return Response.json({ error: "Topic and keywords are required" }, { status: 400 });
    }

    const prompt = buildABTestPrompt(topic, keywords, language);

    const raw = await callAI(prompt, { geminiKey, groqKey });

    const cleaned = raw.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
    const result = JSON.parse(cleaned);

    return Response.json({ variants: result.variants || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("A/B test generation error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
