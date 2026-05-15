"use client";

import { Layers, ImageIcon, Check, Download, Send, ExternalLink, ChevronDown, Plus, Loader2 } from "lucide-react";
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

function getPinterestTokens(): { access_token: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("pincraft_pinterest");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

interface PinterestBoard {
  id: string;
  name: string;
  description: string;
  pin_count: number;
}

function getStoredSettings(): { geminiKey?: string; groqKey?: string; togetherKey?: string; huggingFaceKey?: string } {
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
  const [imageErrors, setImageErrors] = useState<Record<number, string>>({});
  const [boards, setBoards] = useState<PinterestBoard[]>([]);
  const [selectedBoards, setSelectedBoards] = useState<Record<number, string>>({});
  const [publishingPins, setPublishingPins] = useState<Set<number>>(new Set());
  const [publishResults, setPublishResults] = useState<Record<number, { success: boolean; message: string; pinUrl?: string }>>({});
  const [showBoardsFor, setShowBoardsFor] = useState<Set<number>>(new Set());
  const [isConnected] = useState(() => {
    const tokens = getPinterestTokens();
    return !!tokens?.access_token;
  });

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
          huggingFaceKey: settings.huggingFaceKey || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPins((prev) =>
        prev.map((p, i) =>
          i === index ? { ...p, imageDataUrl: data.image.dataUrl, isGeneratingImage: false } : p
        )
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : t(locale, "errorImage");
      setImageErrors((prev) => ({ ...prev, [index]: errMsg }));
      setPins((prev) =>
        prev.map((p, i) => (i === index ? { ...p, isGeneratingImage: false } : p))
      );
    }
  };

  const loadBoards = async () => {
    const tokens = getPinterestTokens();
    if (!tokens?.access_token) return;
    try {
      const res = await fetch("/api/pinterest/boards", {
        headers: { "x-pinterest-token": tokens.access_token },
      });
      if (res.ok) {
        const data = await res.json();
        setBoards(data.boards || []);
      }
    } catch { /* ignore */ }
  };

  const handlePublishPin = async (index: number) => {
    const tokens = getPinterestTokens();
    const pin = pins[index];
    const boardId = selectedBoards[index];
    if (!tokens?.access_token || !pin || !boardId || !pin.imageDataUrl) return;

    setPublishingPins((prev) => new Set(prev).add(index));
    try {
      const res = await fetch("/api/pinterest/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-pinterest-token": tokens.access_token },
        body: JSON.stringify({
          boardId,
          title: pin.pinTitle,
          description: pin.pinDescription,
          imageBase64: pin.imageDataUrl,
          link: websiteUrl,
          altText: pin.altText,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPublishResults((prev) => ({
          ...prev,
          [index]: { success: true, message: t(locale, "pinterestPublished"), pinUrl: `https://www.pinterest.com/pin/${data.pin?.id}` },
        }));
      } else {
        const data = await res.json();
        setPublishResults((prev) => ({
          ...prev,
          [index]: { success: false, message: data.error || t(locale, "pinterestPublishError") },
        }));
      }
    } catch {
      setPublishResults((prev) => ({
        ...prev,
        [index]: { success: false, message: t(locale, "pinterestPublishError") },
      }));
    } finally {
      setPublishingPins((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const toggleBoardsFor = async (index: number) => {
    if (boards.length === 0) await loadBoards();
    setShowBoardsFor((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
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

                <div className="space-y-2 pl-8">
                  <div className="flex items-center gap-2">
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
                        {pin.isGeneratingImage ? (
                          <><Loader2 className="w-3 h-3 animate-spin" />{t(locale, "generatingImage")}</>
                        ) : (
                          <><ImageIcon className="w-3 h-3" />{t(locale, "generateImage")}</>
                        )}
                      </button>
                    )}
                  </div>

                  {imageErrors[i] && (
                    <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
                      {imageErrors[i]}
                    </div>
                  )}

                  {/* Publish to Pinterest button for each pin */}
                  {isConnected && pin.imageDataUrl && (
                    <div className="space-y-2">
                      {!showBoardsFor.has(i) ? (
                        <button
                          onClick={() => toggleBoardsFor(i)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          {t(locale, "publishToPinterest")}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <select
                              value={selectedBoards[i] || ""}
                              onChange={(e) => setSelectedBoards((prev) => ({ ...prev, [i]: e.target.value }))}
                              className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs appearance-none pr-6"
                            >
                              <option value="">{t(locale, "pinterestSelectBoard")}</option>
                              {boards.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-3 h-3 text-muted absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          <button
                            onClick={() => handlePublishPin(i)}
                            disabled={publishingPins.has(i) || !selectedBoards[i]}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                          >
                            {publishingPins.has(i) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                      {publishResults[i] && (
                        <div className={`text-xs rounded-lg px-3 py-1.5 ${
                          publishResults[i].success
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}>
                          {publishResults[i].message}
                          {publishResults[i].pinUrl && (
                            <a href={publishResults[i].pinUrl} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 underline">
                              {t(locale, "pinterestViewPin")} <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
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
