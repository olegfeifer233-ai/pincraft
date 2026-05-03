"use client";

import { Search, Sparkles } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

interface TopicFormProps {
  topic: string;
  setTopic: (topic: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function TopicForm({
  topic,
  setTopic,
  onSubmit,
  isLoading,
}: TopicFormProps) {
  const { locale } = useLocale();

  return (
    <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t(locale, "createPin")}
          </h2>
          <p className="text-sm text-muted">
            {t(locale, "createPinDesc")}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {t(locale, "topicLabel")}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading && topic.trim()) onSubmit();
              }}
              placeholder={t(locale, "topicPlaceholder")}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onSubmit}
            disabled={isLoading || !topic.trim()}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                {t(locale, "analyzing")}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t(locale, "createButton")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
