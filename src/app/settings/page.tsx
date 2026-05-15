"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { Save, Check, ExternalLink, Sparkles, ImageIcon, MessageSquare, Link2, Unlink, Copy } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

interface Settings {
  geminiKey: string;
  groqKey: string;
  togetherKey: string;
  huggingFaceKey: string;
  pinterestAppId: string;
  pinterestAppSecret: string;
  apiKey?: string;
  provider?: string;
}

interface PinterestTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
}

const defaultSettings: Settings = { geminiKey: "", groqKey: "", togetherKey: "", huggingFaceKey: "", pinterestAppId: "", pinterestAppSecret: "" };

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
  if (raw.apiKey && !raw.geminiKey && !raw.groqKey) {
    if (raw.provider === "groq") {
      return { geminiKey: "", groqKey: raw.apiKey, togetherKey: raw.togetherKey || "", huggingFaceKey: raw.huggingFaceKey || "", pinterestAppId: raw.pinterestAppId || "", pinterestAppSecret: raw.pinterestAppSecret || "" };
    }
    return { geminiKey: raw.apiKey, groqKey: "", togetherKey: raw.togetherKey || "", huggingFaceKey: raw.huggingFaceKey || "", pinterestAppId: raw.pinterestAppId || "", pinterestAppSecret: raw.pinterestAppSecret || "" };
  }
  return {
    geminiKey: raw.geminiKey || "",
    groqKey: raw.groqKey || "",
    togetherKey: raw.togetherKey || "",
    huggingFaceKey: raw.huggingFaceKey || "",
    pinterestAppId: raw.pinterestAppId || "",
    pinterestAppSecret: raw.pinterestAppSecret || "",
  };
}

function getPinterestTokens(): PinterestTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("pincraft_pinterest");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
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
  const [pinterestUser, setPinterestUser] = useState<string | null>(null);
  const [pinterestConnecting, setPinterestConnecting] = useState(false);
  const [callbackCopied, setCallbackCopied] = useState(false);
  const { locale } = useLocale();

  const checkPinterestConnection = useCallback(async () => {
    const tokens = getPinterestTokens();
    if (!tokens?.access_token) {
      setPinterestUser(null);
      return;
    }
    try {
      const res = await fetch("/api/pinterest/user", {
        headers: { "x-pinterest-token": tokens.access_token },
      });
      if (res.ok) {
        const data = await res.json();
        setPinterestUser(data.user?.username || "connected");
      } else {
        setPinterestUser(null);
      }
    } catch {
      setPinterestUser(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch sets state in callback, not synchronously
    checkPinterestConnection();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "pinterest_auth" && event.data?.status === "success") {
        checkPinterestConnection();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [checkPinterestConnection]);

  const handlePinterestConnect = async () => {
    if (!settings.pinterestAppId || !settings.pinterestAppSecret) {
      alert(t(locale, "pinterestMissingCredentials"));
      return;
    }
    setPinterestConnecting(true);
    try {
      const res = await fetch(`/api/pinterest/auth?app_id=${encodeURIComponent(settings.pinterestAppId)}&app_secret=${encodeURIComponent(settings.pinterestAppSecret)}`);
      const data = await res.json();
      if (data.authUrl) {
        const popup = window.open(data.authUrl, "pinterest_auth", "width=600,height=700");
        const interval = setInterval(() => {
          if (popup?.closed) {
            clearInterval(interval);
            setPinterestConnecting(false);
            checkPinterestConnection();
          }
        }, 500);
      }
    } catch {
      setPinterestConnecting(false);
    }
  };

  const handlePinterestDisconnect = () => {
    localStorage.removeItem("pincraft_pinterest");
    setPinterestUser(null);
  };

  const handleSave = () => {
    localStorage.setItem("pincraft_settings", JSON.stringify(settings));
    if (settings.pinterestAppId) {
      localStorage.setItem("pincraft_pinterest_app_id", settings.pinterestAppId);
    }
    if (settings.pinterestAppSecret) {
      localStorage.setItem("pincraft_pinterest_app_secret", settings.pinterestAppSecret);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem("pincraft_settings");
    localStorage.removeItem("pincraft_pinterest_app_id");
    localStorage.removeItem("pincraft_pinterest_app_secret");
    setSettings({ geminiKey: "", groqKey: "", togetherKey: "", huggingFaceKey: "", pinterestAppId: "", pinterestAppSecret: "" });
    setSaved(false);
  };

  const callbackUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/pinterest/callback`
    : "";

  const handleCopyCallback = async () => {
    await navigator.clipboard.writeText(callbackUrl);
    setCallbackCopied(true);
    setTimeout(() => setCallbackCopied(false), 2000);
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
        {/* Pinterest Connection */}
        <div className="bg-card-bg rounded-2xl border border-red-200 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t(locale, "pinterestSection")}</h2>
              <p className="text-sm text-muted">{t(locale, "pinterestSectionDesc")}</p>
            </div>
          </div>

          {/* Step-by-step instructions */}
          <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{t(locale, "pinterestHowTo")}</h3>
            <ol className="text-xs text-muted space-y-2 list-decimal list-inside">
              <li>{t(locale, "pinterestStep1")}</li>
              <li>{t(locale, "pinterestStep2")}</li>
              <li>{t(locale, "pinterestStep3")}</li>
              <li>{t(locale, "pinterestStep4")}</li>
              <li>{t(locale, "pinterestStep5")}</li>
            </ol>
          </div>

          {/* Pinterest App ID */}
          <div>
            <label htmlFor="pinterestAppId" className="block text-sm font-medium text-foreground mb-1.5">
              {t(locale, "pinterestAppIdLabel")}
            </label>
            <input
              id="pinterestAppId"
              type="password"
              value={settings.pinterestAppId}
              onChange={(e) => setSettings((s) => ({ ...s, pinterestAppId: e.target.value }))}
              placeholder={t(locale, "pinterestAppIdPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 font-mono text-sm"
            />
          </div>

          {/* Pinterest App Secret */}
          <div>
            <label htmlFor="pinterestAppSecret" className="block text-sm font-medium text-foreground mb-1.5">
              {t(locale, "pinterestAppSecretLabel")}
            </label>
            <input
              id="pinterestAppSecret"
              type="password"
              value={settings.pinterestAppSecret}
              onChange={(e) => setSettings((s) => ({ ...s, pinterestAppSecret: e.target.value }))}
              placeholder={t(locale, "pinterestAppSecretPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 font-mono text-sm"
            />
          </div>

          {pinterestUser ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <span className="text-sm text-green-700 font-medium">
                {t(locale, "pinterestConnected")} @{pinterestUser}
              </span>
              <button
                onClick={handlePinterestDisconnect}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1.5"
              >
                <Unlink className="w-3 h-3" />
                {t(locale, "pinterestDisconnect")}
              </button>
            </div>
          ) : (
            <button
              onClick={handlePinterestConnect}
              disabled={pinterestConnecting || !settings.pinterestAppId || !settings.pinterestAppSecret}
              className="w-full px-4 py-3 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              {pinterestConnecting ? t(locale, "pinterestConnecting") : t(locale, "pinterestConnect")}
            </button>
          )}

          <div className="space-y-2 text-xs text-muted">
            {callbackUrl && (
              <div className="space-y-1">
                <p className="font-medium text-foreground text-xs">{t(locale, "pinterestCallbackUrl")}:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-accent rounded-lg px-3 py-2 text-xs font-mono break-all">
                    {callbackUrl}
                  </code>
                  <button
                    onClick={handleCopyCallback}
                    className="p-2 rounded-lg hover:bg-accent text-muted hover:text-foreground transition-colors shrink-0"
                  >
                    {callbackCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
            <a
              href="https://developers.pinterest.com/apps/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Pinterest Developer Portal
            </a>
          </div>
        </div>

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

        {/* Hugging Face Key */}
        <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
              <span className="text-lg">&#x1F917;</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Hugging Face</h2>
              <p className="text-sm text-muted">{t(locale, "huggingFaceKeyDesc")}</p>
            </div>
          </div>
          <div>
            <label htmlFor="huggingFaceKey" className="block text-sm font-medium text-foreground mb-1.5">
              API Key
            </label>
            <input
              id="huggingFaceKey"
              type="password"
              value={settings.huggingFaceKey}
              onChange={(e) => setSettings((s) => ({ ...s, huggingFaceKey: e.target.value }))}
              placeholder={t(locale, "apiKeyPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono text-sm"
            />
          </div>
          <a
            href="https://huggingface.co/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-yellow-700 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            {t(locale, "huggingFaceLink")}
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
