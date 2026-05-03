"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { UserCircle, ArrowRight } from "lucide-react";
import { TopicForm } from "@/components/TopicForm";
import { AnalysisReport } from "@/components/AnalysisReport";
import { PinContent } from "@/components/PinContent";
import { PinImage } from "@/components/PinImage";
import { BoardCard } from "@/components/BoardCard";
import { StepIndicator } from "@/components/StepIndicator";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

type Step = "idle" | "analyzing" | "analyzed" | "generating" | "generatingImage" | "done";

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
  boardCategory?: string;
  boardTags?: string[];
  boardStrategy?: string;
  accountNiche?: string;
  accountName?: string;
  accountBio?: string;
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
  const [step, setStep] = useState<Step>("idle");
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [pinContent, setPinContent] = useState<PinContentData | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analysisRef = useRef<AnalysisData | null>(null);
  const pinContentRef = useRef<PinContentData | null>(null);
  const { locale } = useLocale();
  const language = locale;

  const generateImage = async (prompt: string) => {
    const settings = getStoredSettings();
    setIsImageGenerating(true);
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          apiKey: settings.apiKey || undefined,
          provider: settings.provider || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageDataUrl(data.image.dataUrl);
    } catch (err) {
      console.error("Image generation error:", err);
      setError(err instanceof Error ? err.message : t(locale, "errorImage"));
    } finally {
      setIsImageGenerating(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setAnalysis(null);
    setPinContent(null);
    setImageDataUrl(null);
    analysisRef.current = null;
    pinContentRef.current = null;

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
      setError(err instanceof Error ? err.message : t(locale, "errorAnalysis"));
      setStep("idle");
      return;
    }

    // Step 2: Generate pin content using analysis result directly
    setStep("generating");
    let pinContentResult: PinContentData;
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
      pinContentResult = generateData.pinContent;
      pinContentRef.current = pinContentResult;
      setPinContent(pinContentResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t(locale, "errorGeneration")
      );
      setStep("analyzed");
      return;
    }

    // Step 3: Generate image from the image prompt
    setStep("generatingImage");
    await generateImage(pinContentResult.imagePrompt);
    setStep("done");
  };

  const handleRegenerate = () => {
    if (pinContentRef.current) {
      setError(null);
      setStep("generatingImage");
      generateImage(pinContentRef.current.imagePrompt).then(() => {
        setStep("done");
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Pin<span className="text-primary">Craft</span>
        </h1>
        <p className="text-muted text-sm sm:text-base">
          {t(locale, "subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        <TopicForm
          topic={topic}
          setTopic={setTopic}
          onSubmit={handleSubmit}
          isLoading={step === "analyzing" || step === "generating" || step === "generatingImage"}
        />

        <StepIndicator currentStep={step} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 animate-fade-in">
            <strong>{t(locale, "errorPrefix")}:</strong> {error}
          </div>
        )}

        {analysis && <AnalysisReport analysis={analysis} />}

        {analysis && pinContent && (
          <BoardCard
            boardName={analysis.recommendedBoardName}
            boardDescription={analysis.recommendedBoardDescription}
            boardCategory={analysis.boardCategory}
            boardTags={analysis.boardTags}
            boardStrategy={analysis.boardStrategy}
          />
        )}

        {pinContent && <PinContent pinContent={pinContent} />}

        {(imageDataUrl || isImageGenerating) && (
          <PinImage
            imageDataUrl={imageDataUrl ?? ""}
            isGenerating={isImageGenerating}
            onRegenerate={handleRegenerate}
          />
        )}

        {/* Cross-link to /account */}
        <Link
          href="/account"
          className="flex items-center justify-between bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100 p-5 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t(locale, "accountBannerTitle")}</p>
              <p className="text-xs text-muted">{t(locale, "accountBannerDesc")}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
