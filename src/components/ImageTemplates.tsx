"use client";

import { Palette, Check } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { t, type TranslationKey } from "@/lib/i18n";

interface Template {
  id: string;
  nameKey: TranslationKey;
  bgGradient: string;
  textColor: string;
  fontWeight: string;
  fontSize: string;
  position: "top" | "center" | "bottom";
  overlay: string;
  preview: string;
}

const templates: Template[] = [
  {
    id: "minimal",
    nameKey: "templateMinimal",
    bgGradient: "from-white to-gray-100",
    textColor: "#1a1a1a",
    fontWeight: "font-light",
    fontSize: "text-xl",
    position: "bottom",
    overlay: "bg-white/70",
    preview: "bg-gradient-to-b from-gray-50 to-white border-gray-200",
  },
  {
    id: "bold",
    nameKey: "templateBold",
    bgGradient: "from-orange-500 to-pink-500",
    textColor: "#ffffff",
    fontWeight: "font-black",
    fontSize: "text-2xl",
    position: "center",
    overlay: "bg-black/30",
    preview: "bg-gradient-to-br from-orange-400 to-pink-500 border-orange-300",
  },
  {
    id: "elegant",
    nameKey: "templateElegant",
    bgGradient: "from-stone-800 to-stone-600",
    textColor: "#d4c5a9",
    fontWeight: "font-serif",
    fontSize: "text-lg",
    position: "center",
    overlay: "bg-black/40",
    preview: "bg-gradient-to-b from-stone-700 to-stone-500 border-stone-400",
  },
  {
    id: "playful",
    nameKey: "templatePlayful",
    bgGradient: "from-yellow-300 to-green-400",
    textColor: "#1a1a1a",
    fontWeight: "font-bold",
    fontSize: "text-xl",
    position: "top",
    overlay: "bg-white/50",
    preview: "bg-gradient-to-br from-yellow-300 to-green-400 border-green-300",
  },
  {
    id: "dark",
    nameKey: "templateDark",
    bgGradient: "from-gray-900 to-gray-800",
    textColor: "#ffffff",
    fontWeight: "font-semibold",
    fontSize: "text-xl",
    position: "bottom",
    overlay: "bg-gradient-to-t from-black/80 to-transparent",
    preview: "bg-gradient-to-b from-gray-800 to-gray-900 border-gray-600",
  },
];

interface ImageTemplatesProps {
  textOverlay: string;
  onApplyTemplate: (template: {
    id: string;
    textColor: string;
    position: string;
    overlay: string;
    fontWeight: string;
    fontSize: string;
  }) => void;
}

export function ImageTemplates({ textOverlay, onApplyTemplate }: ImageTemplatesProps) {
  const { locale } = useLocale();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSelect = (template: Template) => {
    setSelectedTemplate(template.id);
    onApplyTemplate({
      id: template.id,
      textColor: template.textColor,
      position: template.position,
      overlay: template.overlay,
      fontWeight: template.fontWeight,
      fontSize: template.fontSize,
    });
  };

  return (
    <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
          <Palette className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t(locale, "templateTitle")}</h2>
          <p className="text-sm text-muted">{t(locale, "templateDesc")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelect(template)}
            className={`relative rounded-xl border-2 overflow-hidden transition-all ${
              selectedTemplate === template.id
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className={`aspect-[2/3] ${template.preview} flex items-${template.position === "top" ? "start" : template.position === "center" ? "center" : "end"} justify-center p-3`}>
              <div className={`${template.overlay} rounded-lg px-3 py-2 max-w-full`}>
                <p
                  className={`${template.fontWeight} ${template.fontSize} truncate`}
                  style={{ color: template.textColor }}
                >
                  {textOverlay || "Text"}
                </p>
              </div>
            </div>
            <div className="px-3 py-2 bg-card-bg flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                {t(locale, template.nameKey)}
              </span>
              {selectedTemplate === template.id && (
                <Check className="w-3.5 h-3.5 text-primary" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
