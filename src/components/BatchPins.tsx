"use client";

import { Layers, ImageIcon, Check, Download } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

interface BatchPin {
  pinTitle: string;
  pinDescription: string;
  hashtags: string[];
  imagePrompt: string;
  imageStyle: string;
  suggestedTextOverlay: string;
  altText: string;
  imageDataUrl?: string;
  isGeneratingImage?: boolean;
}

interface BatchPinsProps {
  topic: string;
  keywords: string[];
  websiteUrl?: string;
}

function getStoredSettings(): { geminiKey?: string; groqKey?: string; togetherKey?: string } {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("pincraft_settings");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export function BatchPins({ topic, keywords, websiteUrl }: BatchPinsProps) {
  const { locale } = useLocale();
  const [count, setCount] = useState(3);
  const [pins, setPins] = useState<BatchPin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPins, setSelectedPins] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setPins([]);
    setSelectedPins(new Set());
    const settings = getStoredSettings();

    try {
      const res = await fetch("/api/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          keywords,
          count,
          language: locale,
          websiteUrl: websiteUrl || undefined,
          geminiKey: settings.geminiKey || undefined,
          groqKey: settings.groqKey || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPins(data.pins || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const generateImageForPin = async (index: number) => {
    const settings = getStoredSettings();
    const pin = pins[index];
    if (!pin) return;

    setPins((prev) =>
      prev.map((p, i) => (i === index ? { ...p, isGeneratingImage: true } : p))
    );

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: pin.imagePrompt,
          geminiKey: settings.geminiKey || undefined,
          togetherKey: settings.togetherKey || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPins((prev) =>
        prev.map((p, i) =>
          i === index ? { ...p, imageDataUrl: data.image.dataUrl, isGeneratingImage: false } : p
        )
      );
    } catch {
      setPins((prev) =>
        prev.map((p, i) => (i === index ? { ...p, isGeneratingImage: false } : p))
      );
    }
  };

  const toggleSelect = (index: number) => {
    setSelectedPins((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedPins.size === pins.length) {
      setSelectedPins(new Set());
    } else {
      setSelectedPins(new Set(pins.map((_, i) => i)));
    }
  };

  const handleDownload = (pin: BatchPin) => {
    if (!pin.imageDataUrl) return;
    const link = document.createElement("a");
    link.href = pin.imageDataUrl;
    link.download = `pincraft-${pin.pinTitle.slice(0, 30).replace(/\s/g, "-")}.png`;
    link.click();
  };

  return (
    <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Layers className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t(locale, "batchTitle")}</h2>
          <p className="text-sm text-muted">{t(locale, "batchDesc")}</p>
        </div>
      </div>

      {pins.length === 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground">{t(locale, "batchCount")}:</label>
            <div className="flex items-center gap-1">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    count === n
                      ? "bg-indigo-600 text-white"
                      : "bg-accent text-foreground hover:bg-indigo-50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4" />
            {isLoading ? t(locale, "batchGenerating") : t(locale, "batchGenerate")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={selectAll}
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              {t(locale, "batchSelectAll")} ({selectedPins.size}/{pins.length})
            </button>
          </div>

          <div className="grid gap-4">
            {pins.map((pin, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 space-y-3 transition-colors ${
                  selectedPins.has(i) ? "border-indigo-300 bg-indigo-50/30" : "border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleSelect(i)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      selectedPins.has(i)
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-border hover:border-indigo-400"
                    }`}
                  >
                    {selectedPins.has(i) && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted">
                        {t(locale, "batchPin")} {i + 1} {t(locale, "batchOf")} {pins.length}
                      </span>
                      <span className="px-2 py-0.5 bg-accent rounded-full text-xs text-muted capitalize">
                        {pin.imageStyle}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{pin.pinTitle}</p>
                    <p className="text-xs text-muted mt-1 line-clamp-2">{pin.pinDescription}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pin.hashtags.slice(0, 5).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-8">
                  {pin.imageDataUrl ? (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pin.imageDataUrl}
                        alt={pin.altText}
                        className="w-16 h-24 object-cover rounded-lg border border-border"
                      />
                      <button
                        onClick={() => handleDownload(pin)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-accent border border-border transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => generateImageForPin(i)}
                      disabled={pin.isGeneratingImage}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      <ImageIcon className="w-3 h-3" />
                      {pin.isGeneratingImage
                        ? t(locale, "generatingImage")
                        : t(locale, "generateImage")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
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
