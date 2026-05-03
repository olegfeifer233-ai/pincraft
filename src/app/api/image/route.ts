import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, apiKey, provider } = body as {
      prompt: string;
      apiKey?: string;
      provider?: string;
    };

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const pinterestPrompt = `Create a vertical Pinterest pin image (2:3 aspect ratio). ${prompt.trim()}. The image should be visually striking, high quality, and designed to get saves and clicks on Pinterest. No text or letters in the image.`;

    // Try Gemini Imagen first, then Together.ai FLUX
    const geminiKey = apiKey && provider === "gemini" ? apiKey : process.env.GEMINI_API_KEY;
    const togetherKey = process.env.TOGETHER_API_KEY;

    if (geminiKey) {
      try {
        const result = await generateWithGemini(geminiKey, pinterestPrompt);
        return Response.json({ success: true, image: result });
      } catch (err) {
        console.error("Gemini image generation failed:", err);
        if (!togetherKey) throw err;
      }
    }

    if (togetherKey) {
      const result = await generateWithTogether(togetherKey, pinterestPrompt);
      return Response.json({ success: true, image: result });
    }

    return Response.json(
      { error: "No image generation API key configured. Set GEMINI_API_KEY or TOGETHER_API_KEY." },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Image generation error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

async function generateWithGemini(
  apiKey: string,
  prompt: string
): Promise<{ dataUrl: string; mimeType: string }> {
  const models = ["gemini-2.5-flash-image", "gemini-2.0-flash-exp"];

  for (const model of models) {
    try {
      return await tryGeminiModel(apiKey, model, prompt);
    } catch (err) {
      const is404 = err instanceof Error && (err.message.includes("404") || err.message.includes("not found"));
      const is429 = err instanceof Error && err.message.includes("429");
      if ((is404 || is429) && model !== models[models.length - 1]) continue;
      throw err;
    }
  }

  throw new Error("All Gemini image models failed");
}

async function tryGeminiModel(
  apiKey: string,
  model: string,
  prompt: string
): Promise<{ dataUrl: string; mimeType: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
        responseMimeType: "text/plain",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini image API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const candidates = data.candidates ?? [];
  for (const candidate of candidates) {
    for (const part of candidate.content?.parts ?? []) {
      if (part.inlineData) {
        return {
          dataUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          mimeType: part.inlineData.mimeType,
        };
      }
    }
  }

  throw new Error("Gemini did not return an image");
}

async function generateWithTogether(
  apiKey: string,
  prompt: string
): Promise<{ dataUrl: string; mimeType: string }> {
  const response = await fetch("https://api.together.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "black-forest-labs/FLUX.1-schnell",
      prompt,
      width: 768,
      height: 1152,
      steps: 4,
      n: 1,
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Together API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error("Together API did not return an image");

  return {
    dataUrl: `data:image/png;base64,${b64}`,
    mimeType: "image/png",
  };
}
