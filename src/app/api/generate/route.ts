import { NextRequest } from "next/server";
import { callAI } from "@/lib/ai";
import { buildGeneratePrompt } from "@/lib/prompts";
import { scrapeWebsite } from "@/lib/scraper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, websiteUrl, keywords, language = "ru", geminiKey, groqKey } = body as {
      topic: string;
      websiteUrl?: string;
      keywords: string[];
      language?: string;
      geminiKey?: string;
      groqKey?: string;
    };

    if (!topic || !keywords || keywords.length === 0) {
      return Response.json(
        { error: "Topic and keywords are required" },
        { status: 400 }
      );
    }

    let websiteContent: string | undefined;
    if (websiteUrl) {
      websiteContent = await scrapeWebsite(websiteUrl);
    }

    const prompt = buildGeneratePrompt(topic.trim(), keywords, language, websiteUrl, websiteContent);
    const raw = await callAI(prompt, { geminiKey, groqKey });

    const jsonStr = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const pinContent = JSON.parse(jsonStr);

    return Response.json({ success: true, pinContent });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Generate error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
