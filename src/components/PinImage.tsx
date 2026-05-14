"use client";

import { ImageIcon, Download, RefreshCw } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

interface PinImageProps {
  imageDataUrl: string;
  isGenerating: boolean;
  onRegenerate: () => void;
}

export function PinImage({ imageDataUrl, isGenerating, onRegenerate }: PinImageProps) {
  const { locale } = useLocale();

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageDataUrl;
    link.download = `pincraft-pin-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-pink-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t(locale, "generatedImage")}
          </h2>
          <p className="text-sm text-muted">{t(locale, "generatedImageDesc")}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        {isGenerating ? (
          <div className="w-full aspect-[2/3] max-w-sm bg-accent rounded-xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin-slow" />
              <span className="text-sm text-muted">{t(locale, "generatingImage")}</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageDataUrl}
              alt="Generated Pinterest pin"
              className="w-full rounded-xl border border-border shadow-sm"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t(locale, "downloadImage")}
          </button>
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin-slow" : ""}`} />
            {t(locale, "regenerateImage")}
          </button>
        </div>
      </div>
    </div>
  );
}
