export function buildAnalyzePrompt(topic: string, language: string): string {
  const lang = language === "de" ? "German" : language === "ru" ? "Russian" : "English";
  return `You are a Pinterest SEO expert. Analyze the following topic for Pinterest pin creation.

Topic: "${topic}"

Respond in ${lang} with a JSON object (no markdown, no code fences, just pure JSON) with this exact structure:

{
  "topicSummary": "Brief summary of the topic and its Pinterest potential (2-3 sentences)",
  "mainKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "longTailKeywords": ["long tail phrase 1", "long tail phrase 2", "long tail phrase 3", "long tail phrase 4", "long tail phrase 5"],
  "trendingRelated": ["trending related topic 1", "trending related topic 2", "trending related topic 3"],
  "targetAudience": "Who would search for this on Pinterest (1-2 sentences)",
  "competitionLevel": "low" | "medium" | "high",
  "seasonality": "Description of whether this topic has seasonal peaks",
  "recommendedBoardName": "Suggested Pinterest board name optimized for SEO",
  "recommendedBoardDescription": "SEO-optimized board description (2-3 sentences with keywords naturally included)",
  "boardCategory": "The Pinterest category that best fits this topic (e.g. Home Decor, Fashion, Food & Drink, DIY & Crafts, etc.)",
  "boardTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "boardStrategy": "Content strategy for this board: how often to pin, what types of content to mix (own pins vs repins), recommended number of pins to start with, and tips for board growth (2-3 sentences)",
  "accountNiche": "Recommended niche positioning for a Pinterest account focused on this topic (1-2 sentences)",
  "accountName": "Suggested Pinterest account/display name optimized for this niche (catchy, professional, includes niche keyword)",
  "accountBio": "Suggested Pinterest bio/about text optimized for SEO and niche positioning (2-3 sentences, includes keywords, call to action)"
}

Important:
- Keywords should be actual Pinterest search terms people use
- Long-tail keywords should be 3-5 words each
- Board name should be catchy but keyword-rich
- Board tags should be single words or short phrases relevant to the topic
- Board strategy should be actionable and specific
- Account name should be memorable and niche-specific
- Account bio should include keywords naturally and explain what the account offers
- All text must be optimized for Pinterest search algorithm`;
}

export function buildGeneratePrompt(
  topic: string,
  keywords: string[],
  language: string
): string {
  const lang = language === "de" ? "German" : language === "ru" ? "Russian" : "English";
  return `You are a Pinterest content creation expert specializing in SEO-optimized pins.

Topic: "${topic}"
SEO Keywords: ${keywords.join(", ")}

Respond in ${lang} with a JSON object (no markdown, no code fences, just pure JSON) with this exact structure:

{
  "pinTitle": "SEO-optimized pin title (max 100 characters, must include primary keyword)",
  "pinDescription": "SEO-optimized pin description (150-500 characters, naturally includes 3-5 keywords, includes a call to action)",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7", "#hashtag8"],
  "imagePrompt": "Detailed prompt for AI image generation. The image should be vertical (2:3 ratio, 1000x1500px). Describe: composition, colors, style, mood, objects, lighting. The prompt should create a visually compelling Pinterest pin image that would get saves and clicks. Do NOT include any text in the image description - text overlays will be added separately.",
  "imageStyle": "photorealistic" | "illustration" | "flat-design" | "watercolor" | "minimalist" | "3d-render",
  "suggestedTextOverlay": "Short text (3-7 words) to overlay on the pin image for maximum engagement",
  "altText": "Accessible alt text for the pin image (descriptive, includes keywords)",
  "bestTimeToPost": "Recommended day/time to post this pin for maximum engagement",
  "pinVariations": [
    {
      "title": "Alternative pin title variation 1",
      "description": "Alternative description variation 1",
      "textOverlay": "Alternative text overlay 1"
    },
    {
      "title": "Alternative pin title variation 2",
      "description": "Alternative description variation 2",
      "textOverlay": "Alternative text overlay 2"
    }
  ]
}

Important:
- Pin title must be compelling and click-worthy
- Description should tell a story and include keywords naturally (not keyword stuffing)
- Hashtags should mix popular and niche tags
- Image prompt should be detailed enough for DALL-E/Midjourney/Flux to generate a stunning pin
- Text overlay should be bold and attention-grabbing`;
}
