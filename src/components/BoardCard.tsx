"use client";

import { Layout, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

interface BoardCardProps {
  boardName: string;
  boardDescription: string;
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

export function BoardCard({ boardName, boardDescription }: BoardCardProps) {
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
