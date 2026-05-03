import { NextRequest } from "next/server";
import { callAI, AIProvider } from "@/lib/ai";
import { scrapeWebsite } from "@/lib/scraper";

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

    let websiteContext = "";
    if (websiteUrl) {
      const content = await scrapeWebsite(websiteUrl);
      websiteContext = `\nThe user has a website/shop: ${websiteUrl}\nHere is the ACTUAL content from the website:\n---\n${content}\n---\nUse this real content to understand the brand, products, services, and target audience. The Pinterest account should be optimized to drive traffic to this website. The account name and bio should create a clear connection between the Pinterest profile and this website/shop.`;
    }

    const prompt = `You are a Pinterest marketing expert. Analyze this SPECIFIC niche and give CONCRETE, DATA-DRIVEN recommendations.

Niche/Topic: "${niche.trim()}"${websiteContext}

CRITICAL RULES:
- Do NOT use generic phrases like "ist sehr beliebt" or "bietet großes Potenzial" or "is very popular"
- Every recommendation must be SPECIFIC to "${niche.trim()}" — mention real sub-niches, actual trends, concrete numbers
- nicheAnalysis must include: specific monthly search volume estimates on Pinterest, name 2-3 top competing accounts in this niche, explain what makes this niche unique vs similar niches
- contentStrategy must include: exact posting schedule (e.g. "3 pins daily at 8pm"), specific pin formats that work for THIS niche, concrete content ideas unique to this topic
- Board names must be creative and SEO-optimized, not generic

Respond in ${lang} with a JSON object (no markdown, no code fences, just pure JSON):

{
  "accountName": "Creative display name with niche keyword, max 30 chars",
  "username": "lowercase handle, no spaces, brandable",
  "accountBio": "SEO bio max 500 chars: what you offer, keywords, call to action, website connection",
  "accountCategory": "Exact Pinterest business category",
  "profileKeywords": ["5 specific long-tail keywords for this exact niche"],
  "nicheAnalysis": "SPECIFIC analysis: estimated Pinterest search volume for key terms, name 2-3 top competing accounts, what content format dominates (infographics/photos/videos), unique positioning opportunities, competition level with reasoning (4-5 sentences, NO generic statements)",
  "contentStrategy": "SPECIFIC strategy: exact daily pin count, best posting times for THIS audience, which pin formats (standard/idea/video) work best here, specific content ideas unique to this niche, own content vs repin ratio with reasoning (4-5 sentences)",
  "boardSuggestions": [
    {"name": "Main board — core niche topic", "description": "SEO description with keywords"},
    {"name": "Supporting sub-niche board", "description": "SEO description"},
    {"name": "Broader audience expansion board", "description": "SEO description"},
    {"name": "Trending/seasonal board for this niche", "description": "SEO description"},
    {"name": "Lifestyle/inspiration board", "description": "SEO description"}
  ],
  "websiteIntegration": "Specific steps: claim website, Rich Pins setup, Save button placement, traffic strategy (3 sentences)",
  "growthTips": ["5 actionable tips specific to THIS niche — not generic Pinterest advice"]
}`;

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
