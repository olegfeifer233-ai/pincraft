import { GoogleGenerativeAI } from "@google/generative-ai";

export type AIProvider = "gemini" | "groq";

interface CallAIOptions {
  geminiKey?: string;
  groqKey?: string;
  // Legacy fields for backward compat
  apiKey?: string;
  provider?: AIProvider;
}

export async function callAI(
  prompt: string,
  options?: CallAIOptions
): Promise<string> {
  const geminiKey = options?.geminiKey || (options?.provider === "gemini" ? options?.apiKey : undefined) || process.env.GEMINI_API_KEY;
  const groqKey = options?.groqKey || (options?.provider === "groq" ? options?.apiKey : undefined) || process.env.GROQ_API_KEY;

  let lastError: Error | null = null;

  // Try Gemini first
  if (geminiKey) {
    try {
      return await callGemini(geminiKey, prompt);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error("Gemini text failed, trying Groq fallback:", lastError.message);
    }
  }

  // Fallback to Groq
  if (groqKey) {
    try {
      return await callGroq(groqKey, prompt);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  if (lastError) throw lastError;

  throw new Error(
    "No AI API key configured. Set GEMINI_API_KEY or GROQ_API_KEY in environment, or provide your own key in Settings."
  );
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

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
