"use client";

import { useState, useSyncExternalStore } from "react";
import { Key, Save, Check, ExternalLink } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

interface Settings {
  apiKey: string;
  provider: string;
}

const defaultSettings: Settings = { apiKey: "", provider: "gemini" };

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

export default function SettingsPage() {
  const rawSettings = useSyncExternalStore(subscribe, getSettingsSnapshot, getServerSnapshot);
  const storedSettings: Settings = (() => {
    try {
      return { ...defaultSettings, ...JSON.parse(rawSettings) };
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
    setSettings({ apiKey: "", provider: "gemini" });
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

      <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Key className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t(locale, "apiKeyTitle")}
            </h2>
            <p className="text-sm text-muted">
              {t(locale, "apiKeyDesc")}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="provider"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              {t(locale, "providerLabel")}
            </label>
            <select
              id="provider"
              value={settings.provider}
              onChange={(e) =>
                setSettings((s) => ({ ...s, provider: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="gemini">{t(locale, "providerGemini")}</option>
              <option value="groq">{t(locale, "providerGroq")}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              {t(locale, "apiKeyLabel")}
            </label>
            <input
              id="apiKey"
              type="password"
              value={settings.apiKey}
              onChange={(e) =>
                setSettings((s) => ({ ...s, apiKey: e.target.value }))
              }
              placeholder={t(locale, "apiKeyPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono text-sm"
            />
          </div>

          <div className="bg-accent rounded-xl px-4 py-3 text-xs text-muted space-y-2">
            <p className="font-medium text-foreground">{t(locale, "whereToGetKey")}</p>
            <div className="space-y-1">
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-600 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                {t(locale, "geminiLink")}
              </a>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-600 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                {t(locale, "groqLink")}
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
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
