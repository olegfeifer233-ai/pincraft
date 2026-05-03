"use client";

import { useState } from "react";
import {
  UserCircle, Globe, Sparkles, Copy, Check, Layout, TrendingUp,
  LinkIcon, Lightbulb, Search
} from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

interface BoardSuggestion {
  name: string;
  description: string;
}

interface AccountData {
  accountName: string;
  username: string;
  accountBio: string;
  accountCategory: string;
  profileKeywords: string[];
  nicheAnalysis: string;
  contentStrategy: string;
  boardSuggestions: BoardSuggestion[];
  websiteIntegration: string;
  growthTips: string[];
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

function getStoredSettings(): { apiKey?: string; provider?: string } {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("pincraft_settings");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export default function AccountPage() {
  const { locale } = useLocale();
  const [niche, setNiche] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountData | null>(null);

  const handleSubmit = async () => {
    if (!niche.trim()) return;
    setError(null);
    setAccount(null);
    setIsLoading(true);

    const settings = getStoredSettings();

    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: niche.trim(),
          websiteUrl: websiteUrl.trim() || undefined,
          language: locale,
          apiKey: settings.apiKey || undefined,
          provider: settings.provider || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAccount(data.account);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, "errorAnalysis"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {t(locale, "accountPageTitle")}
        </h1>
        <p className="text-muted text-sm sm:text-base">
          {t(locale, "accountPageDesc")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Input form */}
        <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {t(locale, "accountFormTitle")}
              </h2>
              <p className="text-sm text-muted">
                {t(locale, "accountFormDesc")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="niche" className="block text-sm font-medium text-foreground mb-1.5">
                {t(locale, "nicheLabel")}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  id="niche"
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isLoading && niche.trim()) handleSubmit();
                  }}
                  placeholder={t(locale, "nichePlaceholder")}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-foreground mb-1.5">
                {t(locale, "websiteUrlLabel")}
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  id="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder={t(locale, "websiteUrlPlaceholder")}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <p className="text-xs text-muted mt-1">{t(locale, "websiteUrlHint")}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !niche.trim()}
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
                    {t(locale, "analyzeAccount")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 animate-fade-in">
            <strong>{t(locale, "errorPrefix")}:</strong> {error}
          </div>
        )}

        {account && (
          <>
            {/* Account profile */}
            <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t(locale, "profileResult")}</h2>
                  <p className="text-sm text-muted">{t(locale, "profileResultDesc")}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{t(locale, "accountNameLabel")}</span>
                    <CopyButton text={account.accountName} />
                  </div>
                  <p className="text-lg font-bold text-foreground bg-gradient-to-r from-red-50 to-pink-50 rounded-xl px-4 py-3">
                    {account.accountName}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{t(locale, "usernameLabel")}</span>
                    <CopyButton text={account.username} />
                  </div>
                  <p className="text-sm font-mono text-foreground bg-accent rounded-xl px-4 py-3">
                    @{account.username}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{t(locale, "accountBioLabel")}</span>
                    <CopyButton text={account.accountBio} />
                  </div>
                  <p className="text-sm text-foreground/80 bg-accent rounded-xl px-4 py-3 leading-relaxed">
                    {account.accountBio}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{t(locale, "boardCategory")}</span>
                  <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                    {account.accountCategory}
                  </span>
                </div>

                {account.profileKeywords && account.profileKeywords.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-sm font-medium text-foreground">{t(locale, "profileKeywordsLabel")}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {account.profileKeywords.map((kw) => (
                        <span key={kw} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Niche analysis */}
            <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">{t(locale, "nicheAnalysisLabel")}</h2>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{account.nicheAnalysis}</p>

              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-2">{t(locale, "boardStrategyLabel")}</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{account.contentStrategy}</p>
              </div>
            </div>

            {/* Board suggestions */}
            {account.boardSuggestions && account.boardSuggestions.length > 0 && (
              <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Layout className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{t(locale, "suggestedBoards")}</h2>
                    <p className="text-sm text-muted">{t(locale, "suggestedBoardsDesc")}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {account.boardSuggestions.map((board, i) => (
                    <div key={i} className="bg-accent rounded-xl px-4 py-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{board.name}</span>
                        <CopyButton text={`${board.name}\n\n${board.description}`} />
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{board.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Website integration */}
            <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">{t(locale, "websiteIntegrationLabel")}</h2>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{account.websiteIntegration}</p>
            </div>

            {/* Growth tips */}
            {account.growthTips && account.growthTips.length > 0 && (
              <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{t(locale, "growthTipsLabel")}</h2>
                </div>
                <ul className="space-y-2">
                  {account.growthTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
