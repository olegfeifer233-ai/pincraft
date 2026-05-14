"use client";

import { UserCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

interface AccountSetupProps {
  accountNiche: string;
  accountName: string;
  accountBio: string;
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

export function AccountSetup({ accountNiche, accountName, accountBio }: AccountSetupProps) {
  const { locale } = useLocale();

  return (
    <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
          <UserCircle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t(locale, "accountSetupTitle")}
          </h2>
          <p className="text-sm text-muted">{t(locale, "accountSetupDesc")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            {t(locale, "accountNicheLabel")}
          </span>
          <p className="text-sm text-foreground/80 bg-accent rounded-xl px-4 py-3 leading-relaxed">
            {accountNiche}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {t(locale, "accountNameLabel")}
            </span>
            <CopyButton text={accountName} />
          </div>
          <p className="text-base font-semibold text-foreground bg-gradient-to-r from-red-50 to-pink-50 rounded-xl px-4 py-3">
            {accountName}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {t(locale, "accountBioLabel")}
            </span>
            <CopyButton text={accountBio} />
          </div>
          <p className="text-sm text-foreground/80 bg-accent rounded-xl px-4 py-3 leading-relaxed">
            {accountBio}
          </p>
        </div>
      </div>
    </div>
  );
}
