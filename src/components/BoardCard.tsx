"use client";

import { Layout, Copy, Check, ExternalLink, Tag, TrendingUp, Plus, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

interface PinterestBoard {
  id: string;
  name: string;
  description: string;
  pin_count: number;
}

interface BoardCardProps {
  boardName: string;
  boardDescription: string;
  boardCategory?: string;
  boardTags?: string[];
  boardStrategy?: string;
  pinTitle?: string;
  pinDescription?: string;
  imageDataUrl?: string;
  websiteUrl?: string;
  altText?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { locale } = useLocale();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-accent text-muted hover:text-foreground transition-colors"
      title={t(locale, "copy")}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-600" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
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

export function BoardCard({ boardName, boardDescription, boardCategory, boardTags, boardStrategy, pinTitle, pinDescription, imageDataUrl, websiteUrl, altText }: BoardCardProps) {
  const { locale } = useLocale();
  const [isConnected] = useState(() => {
    const tokens = getPinterestTokens();
    return !!tokens?.access_token;
  });
  const [boards, setBoards] = useState<PinterestBoard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string; pinUrl?: string } | null>(null);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [showBoards, setShowBoards] = useState(false);

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
        setShowBoards(true);
      }
    } catch {
      // ignore
    }
  };

  const handleCreateBoard = async () => {
    const tokens = getPinterestTokens();
    if (!tokens?.access_token) return;

    setIsCreatingBoard(true);
    try {
      const res = await fetch("/api/pinterest/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pinterest-token": tokens.access_token,
        },
        body: JSON.stringify({ name: boardName, description: boardDescription }),
      });
      if (res.ok) {
        const data = await res.json();
        setBoards((prev) => [...prev, data.board]);
        setSelectedBoard(data.board.id);
      }
    } catch {
      // ignore
    } finally {
      setIsCreatingBoard(false);
    }
  };

  const handlePublish = async () => {
    const tokens = getPinterestTokens();
    if (!tokens?.access_token || !selectedBoard) return;

    setIsPublishing(true);
    setPublishResult(null);

    try {
      const res = await fetch("/api/pinterest/pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pinterest-token": tokens.access_token,
        },
        body: JSON.stringify({
          boardId: selectedBoard,
          title: pinTitle || boardName,
          description: pinDescription || boardDescription,
          imageBase64: imageDataUrl,
          link: websiteUrl,
          altText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPublishResult({
          success: true,
          message: t(locale, "pinterestPublished"),
          pinUrl: `https://www.pinterest.com/pin/${data.pin?.id}`,
        });
      } else {
        const data = await res.json();
        setPublishResult({ success: false, message: data.error || t(locale, "pinterestPublishError") });
      }
    } catch {
      setPublishResult({ success: false, message: t(locale, "pinterestPublishError") });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <Layout className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t(locale, "boardTitle")}
          </h2>
          <p className="text-sm text-muted">{t(locale, "boardReady")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {t(locale, "boardName")}
            </span>
            <CopyButton text={boardName} />
          </div>
          <p className="text-base font-semibold text-foreground bg-accent rounded-xl px-4 py-3">
            {boardName}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {t(locale, "boardDescription")}
            </span>
            <CopyButton text={boardDescription} />
          </div>
          <p className="text-sm text-foreground/80 bg-accent rounded-xl px-4 py-3 leading-relaxed">
            {boardDescription}
          </p>
        </div>

        {boardCategory && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {t(locale, "boardCategory")}
            </span>
            <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
              {boardCategory}
            </span>
          </div>
        )}

        {boardTags && boardTags.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Tag className="w-4 h-4 text-orange-600" />
              {t(locale, "boardTagsLabel")}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {boardTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {boardStrategy && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              {t(locale, "boardStrategyLabel")}
            </div>
            <p className="text-sm text-foreground/80 bg-orange-50/50 border border-orange-100 rounded-xl px-4 py-3 leading-relaxed">
              {boardStrategy}
            </p>
          </div>
        )}

        {/* Pinterest Publish Section */}
        <div className="pt-3 border-t border-border space-y-3">
          {isConnected ? (
            <>
              {!showBoards ? (
                <button
                  onClick={loadBoards}
                  className="w-full px-4 py-3 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t(locale, "publishToPinterest")}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={selectedBoard}
                        onChange={(e) => setSelectedBoard(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-red-200"
                      >
                        <option value="">{t(locale, "pinterestSelectBoard")}</option>
                        {boards.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.pin_count} pins)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    </div>
                    <button
                      onClick={handleCreateBoard}
                      disabled={isCreatingBoard}
                      className="px-3 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                      title={t(locale, "pinterestCreateBoard")}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handlePublish}
                    disabled={!selectedBoard || isPublishing || !imageDataUrl}
                    className="w-full px-4 py-3 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {isPublishing ? t(locale, "pinterestPublishing") : t(locale, "publishToPinterest")}
                  </button>

                  {!imageDataUrl && (
                    <p className="text-xs text-amber-600 text-center">{t(locale, "pinterestNoImage")}</p>
                  )}
                </div>
              )}

              {publishResult && (
                <div className={`rounded-xl px-4 py-3 text-sm ${publishResult.success ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                  {publishResult.message}
                  {publishResult.pinUrl && (
                    <a
                      href={publishResult.pinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 underline font-medium"
                    >
                      {t(locale, "pinterestViewPin")}
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <button
                disabled
                className="w-full px-4 py-3 rounded-xl bg-red-600/10 text-red-700 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
              >
                <ExternalLink className="w-4 h-4" />
                {t(locale, "publishToPinterest")}
              </button>
              <p className="text-xs text-muted text-center">
                {t(locale, "pinterestNotConnected")}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
