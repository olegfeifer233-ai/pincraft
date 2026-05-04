"use client";

import { useState, useSyncExternalStore } from "react";
import { Save, Check, ExternalLink, Sparkles, ImageIcon, MessageSquare } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

interface Settings {
  geminiKey: string;
  groqKey: string;
  togetherKey: string;
  // Legacy fields kept for migration
  apiKey?: string;
  provider?: string;
}

const defaultSettings: Settings = { geminiKey: "", groqKey: "", togetherKey: "" };

function getSettingsSnapshot(): string {
  if (typeof window === "undefined") return JSON.stringify(defaultSettings);
  return localStorage.getItem("pincraft_settings") || JSON.stringify(defaultSettings);
}

function getServerSnapshot(): string {
  return JSON.stringify(defaultSettings);
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function migrateSettings(raw: Record<string, string>): Settings {
  // Migrate from old single-key format
  if (raw.apiKey && !raw.geminiKey && !raw.groqKey) {
    if (raw.provider === "groq") {
      return { geminiKey: "", groqKey: raw.apiKey, togetherKey: raw.togetherKey || "" };
    }
    return { geminiKey: raw.apiKey, groqKey: "", togetherKey: raw.togetherKey || "" };
  }
  return {
    geminiKey: raw.geminiKey || "",
    groqKey: raw.groqKey || "",
    togetherKey: raw.togetherKey || "",
  };
}

export default function SettingsPage() {
  const rawSettings = useSyncExternalStore(subscribe, getSettingsSnapshot, getServerSnapshot);
  const storedSettings: Settings = (() => {
    try {
      return migrateSettings(JSON.parse(rawSettings));
    } catch {
      return defaultSettings;
    }
  })();

  const [settings, setSettings] = useState<Settings>(storedSettings);
  const [saved, setSaved] = useState(false);
  const { locale } = useLocale();

  const handleSave = () => {
    localStorage.setItem("pincraft_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem("pincraft_settings");
    setSettings({ geminiKey: "", groqKey: "", togetherKey: "" });
    setSaved(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t(locale, "settingsTitle")}</h1>
        <p className="text-sm text-muted">
          {t(locale, "settingsDesc")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Gemini Key */}
        <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Google Gemini</h2>
              <p className="text-sm text-muted">{t(locale, "geminiKeyDesc")}</p>
            </div>
          </div>
          <div>
            <label htmlFor="geminiKey" className="block text-sm font-medium text-foreground mb-1.5">
              API Key
            </label>
            <input
              id="geminiKey"
              type="password"
              value={settings.geminiKey}
              onChange={(e) => setSettings((s) => ({ ...s, geminiKey: e.target.value }))}
              placeholder={t(locale, "apiKeyPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono text-sm"
            />
          </div>
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            {t(locale, "geminiLink")}
          </a>
        </div>

        {/* Groq Key */}
        <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Groq</h2>
              <p className="text-sm text-muted">{t(locale, "groqKeyDesc")}</p>
            </div>
          </div>
          <div>
            <label htmlFor="groqKey" className="block text-sm font-medium text-foreground mb-1.5">
              API Key
            </label>
            <input
              id="groqKey"
              type="password"
              value={settings.groqKey}
              onChange={(e) => setSettings((s) => ({ ...s, groqKey: e.target.value }))}
              placeholder={t(locale, "apiKeyPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono text-sm"
            />
          </div>
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            {t(locale, "groqLink")}
          </a>
        </div>

        {/* Together.ai Key */}
        <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Together.ai</h2>
              <p className="text-sm text-muted">{t(locale, "togetherKeyDesc")}</p>
            </div>
          </div>
          <div>
            <label htmlFor="togetherKey" className="block text-sm font-medium text-foreground mb-1.5">
              API Key
            </label>
            <input
              id="togetherKey"
              type="password"
              value={settings.togetherKey}
              onChange={(e) => setSettings((s) => ({ ...s, togetherKey: e.target.value }))}
              placeholder={t(locale, "apiKeyPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono text-sm"
            />
          </div>
          <a
            href="https://api.together.xyz/settings/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            {t(locale, "togetherLink")}
          </a>
        </div>

        {/* Save/Reset buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors flex items-center gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                {t(locale, "saved")}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t(locale, "save")}
              </>
            )}
          </button>
          <button
            onClick={handleClear}
            className="px-5 py-2.5 rounded-xl border border-border text-muted font-medium text-sm hover:text-foreground hover:border-foreground/20 transition-colors"
          >
            {t(locale, "reset")}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
        <strong>{t(locale, "securityNote")}</strong> {t(locale, "securityText")}{" "}
        <code className="bg-blue-100 px-1 rounded">localStorage</code>{" "}
        {t(locale, "securityText2")}
      </div>
    </div>
  );
}
