import { NextRequest } from "next/server";
import { callAI } from "@/lib/ai";
import { buildBatchPrompt } from "@/lib/prompts";
import { scrapeWebsite } from "@/lib/scraper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, keywords, count, language, websiteUrl, geminiKey, groqKey } = body as {
      topic: string;
      keywords: string[];
      count: number;
      language: string;
      websiteUrl?: string;
      geminiKey?: string;
      groqKey?: string;
    };

    if (!topic || !keywords?.length) {
      return Response.json({ error: "Topic and keywords are required" }, { status: 400 });
    }

    const pinCount = Math.min(Math.max(count || 3, 2), 8);

    let websiteContent: string | undefined;
    if (websiteUrl) {
      try {
        websiteContent = await scrapeWebsite(websiteUrl);
      } catch {
        // continue without website content
      }
    }

    const prompt = buildBatchPrompt(topic, keywords, pinCount, language, websiteUrl, websiteContent);

    const raw = await callAI(prompt, { geminiKey, groqKey });

    const cleaned = raw.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
    const result = JSON.parse(cleaned);

    return Response.json({ pins: result.pins || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Batch generation error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
