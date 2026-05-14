"use client";

import { FlaskConical, Star, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

interface ABVariant {
  title: string;
  approach: string;
  seoScore: number;
  keywordDensity: string;
  emotionalAppeal: string;
  clickPotential: string;
  reasoning: string;
}

interface ABTestCardProps {
  topic: string;
  keywords: string[];
  onSelectTitle: (title: string) => void;
}

function getStoredSettings(): { geminiKey?: string; groqKey?: string } {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("pincraft_settings");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function ScoreBadge({ value }: { value: string }) {
  const colors: Record<string, string> = {
    high: "bg-green-50 text-green-700",
    medium: "bg-yellow-50 text-yellow-700",
    low: "bg-red-50 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[value] || "bg-gray-50 text-gray-700"}`}>
      {value}
    </span>
  );
}

export function ABTestCard({ topic, keywords, onSelectTitle }: ABTestCardProps) {
  const { locale } = useLocale();
  const [variants, setVariants] = useState<ABVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    const settings = getStoredSettings();

    try {
      const res = await fetch("/api/abtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          keywords,
          language: locale,
          geminiKey: settings.geminiKey || undefined,
          groqKey: settings.groqKey || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVariants(data.variants || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const bestIdx = variants.length > 0
    ? variants.reduce((best, v, i) => (v.seoScore > variants[best].seoScore ? i : best), 0)
    : -1;

  return (
    <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
          <FlaskConical className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t(locale, "abTestTitle")}</h2>
          <p className="text-sm text-muted">{t(locale, "abTestDesc")}</p>
        </div>
      </div>

      {variants.length === 0 ? (
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <FlaskConical className="w-4 h-4" />
          {isLoading ? t(locale, "abTestGenerating") : t(locale, "abTestGenerate")}
        </button>
      ) : (
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 space-y-2 ${i === bestIdx ? "border-violet-300 bg-violet-50/30" : "border-border"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted">
                      {t(locale, "abTestVariant")} {i + 1}
                    </span>
                    {i === bestIdx && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3" />
                        {t(locale, "abTestBest")}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-accent rounded-full text-xs text-muted capitalize">
                      {v.approach}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{v.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-violet-600">{v.seoScore}</div>
                  <div className="text-xs text-muted">{t(locale, "abTestScore")}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 text-xs text-muted">
                  {t(locale, "abTestKeywordDensity")}: <ScoreBadge value={v.keywordDensity} />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted">
                  {t(locale, "abTestEmotionalAppeal")}: <ScoreBadge value={v.emotionalAppeal} />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted">
                  {t(locale, "abTestClickPotential")}: <ScoreBadge value={v.clickPotential} />
                </div>
              </div>

              <p className="text-xs text-muted italic">{v.reasoning}</p>

              <button
                onClick={() => onSelectTitle(v.title)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-violet-600 hover:bg-violet-50 border border-violet-200 transition-colors flex items-center gap-1"
              >
                <ArrowRight className="w-3 h-3" />
                {t(locale, "abTestUseThis")}
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
