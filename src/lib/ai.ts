import { GoogleGenerativeAI } from "@google/generative-ai";

export type AIProvider = "gemini" | "groq";

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
}

function getConfig(customApiKey?: string, customProvider?: AIProvider): AIConfig {
  if (customApiKey && customProvider) {
    return { provider: customProvider, apiKey: customApiKey };
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    return { provider: "gemini", apiKey: geminiKey };
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return { provider: "groq", apiKey: groqKey };
  }

  throw new Error(
    "No AI API key configured. Set GEMINI_API_KEY or GROQ_API_KEY in environment, or provide your own key in Settings."
  );
}

export async function callAI(
  prompt: string,
  options?: { apiKey?: string; provider?: AIProvider }
): Promise<string> {
  const config = getConfig(options?.apiKey, options?.provider);

  if (config.provider === "gemini") {
    return callGemini(config.apiKey, prompt);
  }

  if (config.provider === "groq") {
    return callGroq(config.apiKey, prompt);
  }

  throw new Error(`Unknown provider: ${config.provider}`);
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-2.5-flash-preview-05-20", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const is429 = err instanceof Error && err.message.includes("429");
      const isLast = modelName === models[models.length - 1];
      if (is429 && !isLast) continue;
      throw err;
    }
  }

  throw new Error("All Gemini models failed");
}

async function callGroq(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
