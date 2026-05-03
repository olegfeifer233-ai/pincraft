"use client";

import { useState, useRef } from "react";
import { TopicForm } from "@/components/TopicForm";
import { AnalysisReport } from "@/components/AnalysisReport";
import { PinContent } from "@/components/PinContent";
import { StepIndicator } from "@/components/StepIndicator";

type Step = "idle" | "analyzing" | "analyzed" | "generating" | "done";

interface AnalysisData {
  topicSummary: string;
  mainKeywords: string[];
  longTailKeywords: string[];
  trendingRelated: string[];
  targetAudience: string;
  competitionLevel: string;
  seasonality: string;
  recommendedBoardName: string;
  recommendedBoardDescription: string;
}

interface PinVariation {
  title: string;
  description: string;
  textOverlay: string;
}

interface PinContentData {
  pinTitle: string;
  pinDescription: string;
  hashtags: string[];
  imagePrompt: string;
  imageStyle: string;
  suggestedTextOverlay: string;
  altText: string;
  bestTimeToPost: string;
  pinVariations: PinVariation[];
}

function getStoredSettings(): { apiKey?: string; provider?: string } {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("pincraft_settings");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("de");
  const [step, setStep] = useState<Step>("idle");
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [pinContent, setPinContent] = useState<PinContentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const analysisRef = useRef<AnalysisData | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setAnalysis(null);
    setPinContent(null);
    analysisRef.current = null;

    const settings = getStoredSettings();

    // Step 1: Analyze
    setStep("analyzing");
    let analysisResult: AnalysisData;
    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          language,
          apiKey: settings.apiKey || undefined,
          provider: settings.provider || undefined,
        }),
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error);
      analysisResult = analyzeData.analysis;
      analysisRef.current = analysisResult;
      setAnalysis(analysisResult);
      setStep("analyzed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при анализе");
      setStep("idle");
      return;
    }

    // Step 2: Generate pin content using analysis result directly
    setStep("generating");
    try {
      const keywords = [
        ...analysisResult.mainKeywords,
        ...analysisResult.longTailKeywords.slice(0, 3),
      ];

      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords,
          language,
          apiKey: settings.apiKey || undefined,
          provider: settings.provider || undefined,
        }),
      });
      const generateData = await generateRes.json();
      if (!generateRes.ok) throw new Error(generateData.error);
      setPinContent(generateData.pinContent);
      setStep("done");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка при генерации контента"
      );
      setStep("analyzed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Pin<span className="text-primary">Craft</span>
        </h1>
        <p className="text-muted text-sm sm:text-base">
          От темы до готового пина — автоматически
        </p>
      </div>

      <div className="space-y-6">
        <TopicForm
          topic={topic}
          setTopic={setTopic}
          language={language}
          setLanguage={setLanguage}
          onSubmit={handleSubmit}
          isLoading={step === "analyzing" || step === "generating"}
        />

        <StepIndicator currentStep={step} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 animate-fade-in">
            <strong>Ошибка:</strong> {error}
          </div>
        )}

        {analysis && <AnalysisReport analysis={analysis} />}

        {pinContent && <PinContent pinContent={pinContent} />}
      </div>
    </div>
  );
}
