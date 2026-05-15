"use client";

import {
  FileText,
  Hash,
  ImageIcon,
  Clock,
  Type,
  Eye,
  Copy,
  Check,
  Send,
  ExternalLink,
  ChevronDown,
  Plus,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

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

interface PinterestBoard {
  id: string;
  name: string;
  description: string;
  pin_count: number;
}

interface PinContentProps {
  pinContent: PinContentData;
  imageDataUrl?: string;
  websiteUrl?: string;
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

function StyleBadge({ style }: { style: string }) {
  const { locale } = useLocale();
  const labelKeys: Record<string, "stylePhotorealistic" | "styleIllustration" | "styleFlatDesign" | "styleWatercolor" | "styleMinimalist" | "style3dRender"> = {
    photorealistic: "stylePhotorealistic",
    illustration: "styleIllustration",
    "flat-design": "styleFlatDesign",
    watercolor: "styleWatercolor",
    minimalist: "styleMinimalist",
    "3d-render": "style3dRender",
  };
  const label = labelKeys[style] ? t(locale, labelKeys[style]) : style;

  return (
    <span className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
      {label}
    </span>
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

export function PinContent({ pinContent, imageDataUrl, websiteUrl }: PinContentProps) {
  const { locale } = useLocale();
  const [isConnected] = useState(() => {
    const tokens = getPinterestTokens();
    return !!tokens?.access_token;
  });
  const [boards, setBoards] = useState<PinterestBoard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string; pinUrl?: string } | null>(null);
  const [showBoards, setShowBoards] = useState(false);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);

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
    } catch { /* ignore */ }
  };

  const handleCreateBoard = async () => {
    const tokens = getPinterestTokens();
    if (!tokens?.access_token) return;
    setIsCreatingBoard(true);
    try {
      const res = await fetch("/api/pinterest/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-pinterest-token": tokens.access_token },
        body: JSON.stringify({ name: pinContent.pinTitle.slice(0, 50), description: pinContent.pinDescription.slice(0, 200) }),
      });
      if (res.ok) {
        const data = await res.json();
        setBoards((prev) => [...prev, data.board]);
        setSelectedBoard(data.board.id);
      }
    } catch { /* ignore */ } finally {
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
        headers: { "Content-Type": "application/json", "x-pinterest-token": tokens.access_token },
        body: JSON.stringify({
          boardId: selectedBoard,
          title: pinContent.pinTitle,
          description: pinContent.pinDescription,
          imageBase64: imageDataUrl,
          link: websiteUrl,
          altText: pinContent.altText,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPublishResult({ success: true, message: t(locale, "pinterestPublished"), pinUrl: `https://www.pinterest.com/pin/${data.pin?.id}` });
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
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t(locale, "pinContent")}
          </h2>
          <p className="text-sm text-muted">{t(locale, "readyContent")}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Type className="w-4 h-4 text-primary" />
              {t(locale, "seoTitle")}
            </div>
            <CopyButton text={pinContent.pinTitle} />
          </div>
          <p className="text-base font-semibold text-foreground bg-accent rounded-xl px-4 py-3">
            {pinContent.pinTitle}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="w-4 h-4 text-blue-600" />
              {t(locale, "seoDescription")}
            </div>
            <CopyButton text={pinContent.pinDescription} />
          </div>
          <p className="text-sm text-foreground/80 bg-accent rounded-xl px-4 py-3 leading-relaxed">
            {pinContent.pinDescription}
          </p>
        </div>

        {/* Hashtags */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Hash className="w-4 h-4 text-emerald-600" />
              {t(locale, "hashtags")}
            </div>
            <CopyButton text={pinContent.hashtags.join(" ")} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pinContent.hashtags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Text Overlay */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Type className="w-4 h-4 text-orange-600" />
              {t(locale, "textOnImage")}
            </div>
            <CopyButton text={pinContent.suggestedTextOverlay} />
          </div>
          <p className="text-lg font-bold text-center text-foreground bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl px-4 py-4">
            {pinContent.suggestedTextOverlay}
          </p>
        </div>

        {/* Image Prompt */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ImageIcon className="w-4 h-4 text-violet-600" />
              {t(locale, "imagePrompt")}
              <StyleBadge style={pinContent.imageStyle} />
            </div>
            <CopyButton text={pinContent.imagePrompt} />
          </div>
          <p className="text-sm text-foreground/80 bg-violet-50/50 border border-violet-100 rounded-xl px-4 py-3 leading-relaxed font-mono">
            {pinContent.imagePrompt}
          </p>
        </div>

        {/* Alt Text */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Eye className="w-4 h-4 text-muted" />
              {t(locale, "altText")}
            </div>
            <CopyButton text={pinContent.altText} />
          </div>
          <p className="text-xs text-muted bg-accent rounded-xl px-4 py-2.5">
            {pinContent.altText}
          </p>
        </div>

        {/* Best Time */}
        <div className="flex items-center gap-2 text-sm text-muted">
          <Clock className="w-4 h-4" />
          <span>{t(locale, "bestTimeToPost")}</span>
          <span className="font-medium text-foreground">
            {pinContent.bestTimeToPost}
          </span>
        </div>

        {/* Variations */}
        {pinContent.pinVariations && pinContent.pinVariations.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-border">
            <h3 className="text-sm font-medium text-foreground">
              {t(locale, "alternativeVariants")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pinContent.pinVariations.map((v, i) => (
                <div
                  key={i}
                  className="bg-accent rounded-xl px-4 py-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">{t(locale, "variant")} {i + 1}</span>
                    <CopyButton
                      text={`${v.title}\n\n${v.description}\n\n${t(locale, "textLabel")} ${v.textOverlay}`}
                    />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {v.title}
                  </p>
                  <p className="text-xs text-muted leading-relaxed">
                    {v.description}
                  </p>
                  <p className="text-xs font-medium text-orange-600">
                    «{v.textOverlay}»
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publish to Pinterest */}
        <div className="pt-4 border-t border-border space-y-3">
          {!isConnected ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Send className="w-4 h-4" />
              <span>{t(locale, "pinterestNotConnected")}</span>
            </div>
          ) : !imageDataUrl ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <ImageIcon className="w-4 h-4" />
              <span>{t(locale, "pinterestNoImage")}</span>
            </div>
          ) : (
            <div className="space-y-3">
              {!showBoards ? (
                <button
                  onClick={loadBoards}
                  className="w-full px-4 py-3 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {t(locale, "publishToPinterest")}
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={selectedBoard}
                        onChange={(e) => setSelectedBoard(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm appearance-none pr-8"
                      >
                        <option value="">{t(locale, "pinterestSelectBoard")}</option>
                        {boards.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <button
                      onClick={handleCreateBoard}
                      disabled={isCreatingBoard}
                      className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing || !selectedBoard}
                    className="w-full px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isPublishing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />{t(locale, "pinterestPublishing")}</>
                    ) : (
                      <><Send className="w-4 h-4" />{t(locale, "publishToPinterest")}</>
                    )}
                  </button>
                </>
              )}
              {publishResult && (
                <div className={`rounded-xl px-4 py-3 text-sm ${
                  publishResult.success
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}>
                  <span>{publishResult.message}</span>
                  {publishResult.pinUrl && (
                    <a href={publishResult.pinUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 underline">
                      {t(locale, "pinterestViewPin")} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
