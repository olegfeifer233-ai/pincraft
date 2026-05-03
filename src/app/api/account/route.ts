import { NextRequest } from "next/server";
import { callAI, AIProvider } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { niche, websiteUrl, language = "de", apiKey, provider } = body as {
      niche: string;
      websiteUrl?: string;
      language?: string;
      apiKey?: string;
      provider?: AIProvider;
    };

    if (!niche || typeof niche !== "string" || niche.trim().length === 0) {
      return Response.json(
        { error: "Niche or topic is required" },
        { status: 400 }
      );
    }

    const lang = language === "de" ? "German" : language === "ru" ? "Russian" : "English";
    const websiteContext = websiteUrl
      ? `\nThe user has a website/shop: ${websiteUrl}\nAnalyze this URL to understand the brand, products, and target audience. The Pinterest account should be optimized to drive traffic to this website. The account name and bio should create a clear connection between the Pinterest profile and this website/shop.`
      : "";

    const prompt = `You are a Pinterest marketing expert specializing in business account optimization.

A user wants to create a Pinterest business account for the following niche/topic: "${niche.trim()}"${websiteContext}

Respond in ${lang} with a JSON object (no markdown, no code fences, just pure JSON) with this exact structure:

{
  "accountName": "Suggested Pinterest display name — professional, memorable, includes niche keyword, max 30 characters. Should clearly communicate what the account is about.",
  "username": "Suggested Pinterest username (handle) — lowercase, no spaces, use dots or underscores if needed. Short and brandable.",
  "accountBio": "SEO-optimized Pinterest bio (max 500 characters). Should include: what the account offers, target keywords, call to action, and connection to website if provided. Write in a friendly, professional tone.",
  "accountCategory": "The Pinterest business category that best fits (e.g., Home Decor, Fashion, Food & Drink, Health & Wellness, DIY & Crafts, Education, Technology, etc.)",
  "profileKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "nicheAnalysis": "Detailed analysis of this niche on Pinterest: how popular it is, what type of content performs best, the competition level, and the growth potential (3-4 sentences).",
  "contentStrategy": "Content strategy recommendations: what types of pins to create, posting frequency, best times to post, ratio of own content vs repins, how to use idea pins and video pins (3-4 sentences).",
  "boardSuggestions": [
    {
      "name": "Board name 1 — main board directly related to the niche",
      "description": "SEO-optimized board description with keywords"
    },
    {
      "name": "Board name 2 — related supporting topic",
      "description": "SEO-optimized board description"
    },
    {
      "name": "Board name 3 — broader related topic for audience expansion",
      "description": "SEO-optimized board description"
    },
    {
      "name": "Board name 4 — trending/seasonal related topic",
      "description": "SEO-optimized board description"
    },
    {
      "name": "Board name 5 — inspiration/lifestyle board",
      "description": "SEO-optimized board description"
    }
  ],
  "websiteIntegration": "Tips for connecting the Pinterest account with the website: how to claim the website, add Save buttons, use Rich Pins, and drive traffic (2-3 sentences). If no website was provided, give general tips for future website integration.",
  "growthTips": ["Actionable tip 1 for growing the account", "Actionable tip 2", "Actionable tip 3", "Actionable tip 4", "Actionable tip 5"]
}

Important:
- Account name must be catchy yet professional and include a niche keyword
- Bio must be SEO-optimized with natural keyword placement
- Board suggestions should cover the niche comprehensively
- All recommendations should follow Pinterest's best practices for business accounts
- If a website URL is provided, all recommendations should be aligned with that brand`;

    const raw = await callAI(prompt, { apiKey, provider });
    const jsonStr = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const accountData = JSON.parse(jsonStr);

    return Response.json({ success: true, account: accountData });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Account analysis error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
