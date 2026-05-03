"use client";

import { Layout, Copy, Check, ExternalLink, Tag, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

interface BoardCardProps {
  boardName: string;
  boardDescription: string;
  boardCategory?: string;
  boardTags?: string[];
  boardStrategy?: string;
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

export function BoardCard({ boardName, boardDescription, boardCategory, boardTags, boardStrategy }: BoardCardProps) {
  const { locale } = useLocale();

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

        <div className="pt-3 border-t border-border">
          <button
            disabled
            className="w-full px-4 py-3 rounded-xl bg-red-600/10 text-red-700 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
          >
            <ExternalLink className="w-4 h-4" />
            {t(locale, "publishToPinterest")}
          </button>
          <p className="text-xs text-muted text-center mt-2">
            {t(locale, "pinterestComingSoon")}
          </p>
        </div>
      </div>
    </div>
  );
}
