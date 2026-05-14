"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

const content = {
  de: {
    title: "Datenschutzrichtlinie",
    lastUpdated: "Zuletzt aktualisiert: Mai 2026",
    sections: [
      {
        heading: "1. Einleitung",
        text: "PinCraft ist ein KI-gestütztes Tool zur Erstellung von Pinterest-Pins. Der Schutz Ihrer Daten ist uns wichtig. Diese Datenschutzrichtlinie erklärt, welche Daten wir erheben, wie wir sie verwenden und welche Rechte Sie haben.",
      },
      {
        heading: "2. Welche Daten wir erheben",
        text: "PinCraft erhebt und speichert minimale Daten:\n\n• API-Schlüssel (Gemini, Groq, Together.ai) — werden ausschließlich lokal in Ihrem Browser (localStorage) gespeichert und niemals an unsere Server übertragen.\n• Pinterest App ID und App Secret — werden lokal in Ihrem Browser gespeichert und nur für die OAuth-Authentifizierung mit Pinterest verwendet.\n• Pinterest OAuth-Token — wird nach erfolgreicher Autorisierung lokal in Ihrem Browser gespeichert.\n• Themen und Website-URLs — werden an KI-Anbieter (Google Gemini, Groq, Together.ai) zur Inhaltserstellung gesendet, aber nicht von uns gespeichert.\n• Geplante Pins — werden lokal in Ihrem Browser gespeichert.",
      },
      {
        heading: "3. Wie wir Ihre Daten verwenden",
        text: "Ihre Daten werden ausschließlich verwendet für:\n\n• Erstellung von SEO-optimierten Pinterest-Inhalten mithilfe von KI\n• Generierung von Bildern für Pins\n• Verbindung mit Ihrem Pinterest-Konto (wenn Sie dies autorisieren)\n• Veröffentlichung von Pins auf Ihrem Pinterest-Konto (wenn Sie dies autorisieren)",
      },
      {
        heading: "4. Datenspeicherung",
        text: "PinCraft speichert keine Benutzerdaten auf Servern. Alle Einstellungen, API-Schlüssel und Token werden ausschließlich lokal in Ihrem Browser (localStorage) gespeichert. Sie können alle gespeicherten Daten jederzeit löschen, indem Sie die Browser-Daten löschen oder die Schaltfläche 'Zurücksetzen' in den Einstellungen verwenden.",
      },
      {
        heading: "5. Drittanbieter-Dienste",
        text: "PinCraft verwendet folgende Drittanbieter-Dienste:\n\n• Google Gemini API — für Textgenerierung und Bildgenerierung\n• Groq API — für Textgenerierung\n• Together.ai API — für Bildgenerierung (FLUX)\n• Pinterest API — für OAuth-Authentifizierung und Pin-Veröffentlichung\n\nJeder dieser Dienste hat eigene Datenschutzrichtlinien. Wir empfehlen, diese zu lesen.",
      },
      {
        heading: "6. Cookies",
        text: "PinCraft verwendet keine Cookies. Alle Daten werden über localStorage im Browser gespeichert.",
      },
      {
        heading: "7. Ihre Rechte",
        text: "Sie haben das Recht:\n\n• Alle lokal gespeicherten Daten einzusehen (über die Browser-Entwicklertools → Application → Local Storage)\n• Alle Daten zu löschen (über Einstellungen → Zurücksetzen, oder Browser-Daten löschen)\n• Die Pinterest-Verbindung jederzeit zu trennen\n• Die Nutzung von PinCraft jederzeit einzustellen",
      },
      {
        heading: "8. Kontakt",
        text: "Bei Fragen zum Datenschutz kontaktieren Sie uns über das GitHub-Repository: https://github.com/olegfeifer233-ai/pincraft",
      },
    ],
  },
  ru: {
    title: "Политика конфиденциальности",
    lastUpdated: "Последнее обновление: май 2026",
    sections: [
      {
        heading: "1. Введение",
        text: "PinCraft — это AI-инструмент для создания Pinterest-пинов. Защита ваших данных важна для нас. Эта политика конфиденциальности объясняет, какие данные мы собираем, как используем и какие у вас есть права.",
      },
      {
        heading: "2. Какие данные мы собираем",
        text: "PinCraft собирает и хранит минимум данных:\n\n• API-ключи (Gemini, Groq, Together.ai) — хранятся исключительно локально в вашем браузере (localStorage) и никогда не передаются на наши серверы.\n• Pinterest App ID и App Secret — хранятся локально в браузере и используются только для OAuth-авторизации с Pinterest.\n• Pinterest OAuth-токен — сохраняется локально в браузере после успешной авторизации.\n• Темы и URL сайтов — отправляются AI-провайдерам (Google Gemini, Groq, Together.ai) для генерации контента, но не сохраняются нами.\n• Запланированные пины — хранятся локально в браузере.",
      },
      {
        heading: "3. Как мы используем ваши данные",
        text: "Ваши данные используются исключительно для:\n\n• Создания SEO-оптимизированного контента для Pinterest с помощью AI\n• Генерации изображений для пинов\n• Подключения к вашему Pinterest-аккаунту (если вы это разрешите)\n• Публикации пинов в вашем Pinterest-аккаунте (если вы это разрешите)",
      },
      {
        heading: "4. Хранение данных",
        text: "PinCraft не хранит данные пользователей на серверах. Все настройки, API-ключи и токены хранятся исключительно локально в вашем браузере (localStorage). Вы можете удалить все сохранённые данные в любой момент, очистив данные браузера или нажав кнопку 'Сбросить' в настройках.",
      },
      {
        heading: "5. Сторонние сервисы",
        text: "PinCraft использует следующие сторонние сервисы:\n\n• Google Gemini API — для генерации текста и изображений\n• Groq API — для генерации текста\n• Together.ai API — для генерации изображений (FLUX)\n• Pinterest API — для OAuth-авторизации и публикации пинов\n\nУ каждого сервиса своя политика конфиденциальности. Рекомендуем ознакомиться с ними.",
      },
      {
        heading: "6. Cookies",
        text: "PinCraft не использует cookies. Все данные хранятся через localStorage в браузере.",
      },
      {
        heading: "7. Ваши права",
        text: "Вы имеете право:\n\n• Просматривать все локально сохранённые данные (через инструменты разработчика браузера → Application → Local Storage)\n• Удалить все данные (через Настройки → Сбросить, или очистить данные браузера)\n• Отключить Pinterest-подключение в любой момент\n• Прекратить использование PinCraft в любое время",
      },
      {
        heading: "8. Контакты",
        text: "По вопросам конфиденциальности обращайтесь через GitHub-репозиторий: https://github.com/olegfeifer233-ai/pincraft",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: May 2026",
    sections: [
      {
        heading: "1. Introduction",
        text: "PinCraft is an AI-powered tool for creating Pinterest pins. Protecting your data is important to us. This privacy policy explains what data we collect, how we use it, and what rights you have.",
      },
      {
        heading: "2. What Data We Collect",
        text: "PinCraft collects and stores minimal data:\n\n• API keys (Gemini, Groq, Together.ai) — stored exclusively in your browser's localStorage and never transmitted to our servers.\n• Pinterest App ID and App Secret — stored locally in your browser and used only for OAuth authentication with Pinterest.\n• Pinterest OAuth token — stored locally in your browser after successful authorization.\n• Topics and website URLs — sent to AI providers (Google Gemini, Groq, Together.ai) for content generation but not stored by us.\n• Scheduled pins — stored locally in your browser.",
      },
      {
        heading: "3. How We Use Your Data",
        text: "Your data is used exclusively for:\n\n• Creating SEO-optimized Pinterest content using AI\n• Generating images for pins\n• Connecting to your Pinterest account (if you authorize this)\n• Publishing pins to your Pinterest account (if you authorize this)",
      },
      {
        heading: "4. Data Storage",
        text: "PinCraft does not store any user data on servers. All settings, API keys, and tokens are stored exclusively in your browser's localStorage. You can delete all stored data at any time by clearing browser data or using the \"Reset\" button in Settings.",
      },
      {
        heading: "5. Third-Party Services",
        text: "PinCraft uses the following third-party services:\n\n• Google Gemini API — for text and image generation\n• Groq API — for text generation\n• Together.ai API — for image generation (FLUX)\n• Pinterest API — for OAuth authentication and pin publishing\n\nEach service has its own privacy policy. We recommend reviewing them.",
      },
      {
        heading: "6. Cookies",
        text: "PinCraft does not use cookies. All data is stored via localStorage in the browser.",
      },
      {
        heading: "7. Your Rights",
        text: "You have the right to:\n\n• View all locally stored data (via browser DevTools → Application → Local Storage)\n• Delete all data (via Settings → Reset, or clear browser data)\n• Disconnect Pinterest at any time\n• Stop using PinCraft at any time",
      },
      {
        heading: "8. Contact",
        text: "For privacy questions, contact us via the GitHub repository: https://github.com/olegfeifer233-ai/pincraft",
      },
    ],
  },
};

export default function PrivacyPage() {
  const { locale } = useLocale();
  const c = content[locale];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === "de" ? "Zurück zur Startseite" : locale === "ru" ? "Назад на главную" : "Back to Home"}
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{c.title}</h1>
        </div>
        <p className="text-sm text-muted mb-10">{c.lastUpdated}</p>

        <div className="space-y-8">
          {c.sections.map((section, i) => (
            <section key={i} className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>
              <div className="text-sm text-muted leading-relaxed whitespace-pre-line">{section.text}</div>
            </section>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-border text-center text-xs text-muted">
          PinCraft &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
