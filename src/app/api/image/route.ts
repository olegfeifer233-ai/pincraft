import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, geminiKey: userGeminiKey, togetherKey: userTogetherKey, huggingFaceKey: userHuggingFaceKey } = body as {
      prompt: string;
      geminiKey?: string;
      togetherKey?: string;
      huggingFaceKey?: string;
    };

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const pinterestPrompt = `Create a vertical Pinterest pin image (2:3 aspect ratio). ${prompt.trim()}. The image should be visually striking, high quality, and designed to get saves and clicks on Pinterest. No text or letters in the image.`;

    // Try Gemini Imagen first, then Together.ai FLUX, then Hugging Face
    const geminiKey = userGeminiKey || process.env.GEMINI_API_KEY;
    const togetherKey = userTogetherKey || process.env.TOGETHER_API_KEY;
    const huggingFaceKey = userHuggingFaceKey || process.env.HUGGINGFACE_API_KEY;

    let lastError: string | null = null;

    if (geminiKey) {
      try {
        const result = await generateWithGemini(geminiKey, pinterestPrompt);
        return Response.json({ success: true, image: result });
      } catch (err) {
        console.error("Gemini image generation failed:", err);
        lastError = err instanceof Error ? err.message : "Gemini failed";
      }
    }

    if (togetherKey) {
      try {
        const result = await generateWithTogether(togetherKey, pinterestPrompt);
        return Response.json({ success: true, image: result });
      } catch (err) {
        console.error("Together image generation failed:", err);
        lastError = err instanceof Error ? err.message : "Together failed";
      }
    }

    if (huggingFaceKey) {
      try {
        const result = await generateWithHuggingFace(huggingFaceKey, pinterestPrompt);
        return Response.json({ success: true, image: result });
      } catch (err) {
        console.error("Hugging Face image generation failed:", err);
        lastError = err instanceof Error ? err.message : "Hugging Face failed";
      }
    }

    if (!geminiKey && !togetherKey && !huggingFaceKey) {
      return Response.json(
        { error: "No image generation API key configured. Set a Gemini, Together.ai, or Hugging Face API key in Settings." },
        { status: 400 }
      );
    }

    const isQuotaError = lastError && (lastError.includes("429") || lastError.includes("quota") || lastError.includes("RESOURCE_EXHAUSTED"));
    return Response.json(
      { error: isQuotaError
          ? "Image generation quota exhausted for today. Try again tomorrow or use a different API key in Settings."
          : lastError || "Image generation failed" },
      { status: isQuotaError ? 429 : 500 }
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
  const models = ["gemini-2.5-flash-image", "gemini-3.1-flash-image-preview"];

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

async function generateWithHuggingFace(
  apiKey: string,
  prompt: string
): Promise<{ dataUrl: string; mimeType: string }> {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: 768,
          height: 1152,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const contentType = response.headers.get("content-type") || "image/jpeg";

  return {
    dataUrl: `data:${contentType};base64,${base64}`,
    mimeType: contentType,
  };
}
