import { NextRequest } from "next/server";
import { callAI } from "@/lib/ai";
import { buildAnalyzePrompt } from "@/lib/prompts";
import { scrapeWebsite } from "@/lib/scraper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, websiteUrl, language = "ru", geminiKey, groqKey } = body as {
      topic: string;
      websiteUrl?: string;
      language?: string;
      geminiKey?: string;
      groqKey?: string;
    };

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return Response.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    let websiteContent: string | undefined;
    if (websiteUrl) {
      websiteContent = await scrapeWebsite(websiteUrl);
    }

    const prompt = buildAnalyzePrompt(topic.trim(), language, websiteUrl, websiteContent);
    const raw = await callAI(prompt, { geminiKey, groqKey });

    const jsonStr = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(jsonStr);

    return Response.json({ success: true, analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Analyze error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
