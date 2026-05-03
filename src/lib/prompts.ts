export function buildAnalyzePrompt(topic: string, language: string): string {
  const lang = language === "de" ? "German" : language === "ru" ? "Russian" : "English";
  return `You are a Pinterest SEO data analyst. Provide a SPECIFIC, DATA-DRIVEN analysis for pin creation.

Topic: "${topic}"

CRITICAL RULES:
- Do NOT use generic filler phrases like "is very popular", "has great potential", "ist sehr beliebt", "bietet großes Potenzial"
- topicSummary must contain SPECIFIC insights: estimated monthly searches, what angle/sub-niche is underserved, why THIS topic works on Pinterest specifically (not just "it's visual")
- targetAudience must name specific demographics with ages, interests, and behaviors — not vague "people interested in X"
- seasonality must cite specific months or events, not just "has seasonal variation"
- boardStrategy must include exact numbers: daily pin count, specific ratio (e.g. "70% own, 30% repins"), recommended starting pins count
- competitionLevel must be justified with reasoning

Respond in ${lang} with a JSON object (no markdown, no code fences, just pure JSON):

{
  "topicSummary": "SPECIFIC analysis: estimated Pinterest search volume, what sub-niche angle is underserved, why this works on Pinterest specifically (2-3 sentences, NO generic filler)",
  "mainKeywords": ["5 actual high-volume Pinterest search terms"],
  "longTailKeywords": ["5 specific 3-5 word phrases people actually search on Pinterest"],
  "trendingRelated": ["3 currently trending related topics on Pinterest"],
  "targetAudience": "Specific demographics: age range, gender split, interests, buying behavior, platform usage patterns (2 sentences)",
  "competitionLevel": "low" | "medium" | "high",
  "seasonality": "Specific months/events when this peaks, with relative search increase estimate",
  "recommendedBoardName": "Creative, SEO-optimized board name",
  "recommendedBoardDescription": "SEO board description with natural keywords (2-3 sentences)",
  "boardCategory": "Exact Pinterest category",
  "boardTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "boardStrategy": "SPECIFIC strategy with numbers: exact daily pin count, own/repin ratio, starting pin count, posting times for this audience (2-3 sentences)"
}`;
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
