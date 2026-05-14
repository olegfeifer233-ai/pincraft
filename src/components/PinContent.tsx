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

interface PinContentProps {
  pinContent: PinContentData;
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

export function PinContent({ pinContent }: PinContentProps) {
  const { locale } = useLocale();

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
      </div>
    </div>
  );
}
