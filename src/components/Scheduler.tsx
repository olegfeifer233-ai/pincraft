"use client";

import { Calendar, Clock, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

interface ScheduledPin {
  id: string;
  title: string;
  description: string;
  imageDataUrl?: string;
  scheduledDate: string;
  scheduledTime: string;
  boardId?: string;
  createdAt: number;
}

interface SchedulerProps {
  pinTitle?: string;
  pinDescription?: string;
  imageDataUrl?: string;
  bestTimeToPost?: string;
}

function getScheduledPins(): ScheduledPin[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("pincraft_scheduled");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function saveScheduledPins(pins: ScheduledPin[]) {
  localStorage.setItem("pincraft_scheduled", JSON.stringify(pins));
}

export function Scheduler({ pinTitle, pinDescription, imageDataUrl, bestTimeToPost }: SchedulerProps) {
  const { locale } = useLocale();
  const [scheduledPins, setScheduledPins] = useState<ScheduledPin[]>(() => getScheduledPins());
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSchedule = () => {
    if (!date || !time || !pinTitle) return;

    const newPin: ScheduledPin = {
      id: crypto.randomUUID(),
      title: pinTitle,
      description: pinDescription || "",
      imageDataUrl,
      scheduledDate: date,
      scheduledTime: time,
      createdAt: Date.now(),
    };

    const updated = [...scheduledPins, newPin].sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
      const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
      return dateA.getTime() - dateB.getTime();
    });

    setScheduledPins(updated);
    saveScheduledPins(updated);
    setShowForm(false);
    setDate("");
    setTime("");
  };

  const handleRemove = (id: string) => {
    const updated = scheduledPins.filter((p) => p.id !== id);
    setScheduledPins(updated);
    saveScheduledPins(updated);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t(locale, "schedulerTitle")}</h2>
          <p className="text-sm text-muted">{t(locale, "schedulerDesc")}</p>
        </div>
      </div>

      {bestTimeToPost && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-teal-50 border border-teal-100 rounded-xl text-sm text-teal-700">
          <Clock className="w-4 h-4 shrink-0" />
          <span>{t(locale, "schedulerOptimalTime")} {bestTimeToPost}</span>
        </div>
      )}

      {pinTitle && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 rounded-xl bg-teal-600 text-white font-medium text-sm hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <Plus className="w-4 h-4" />
          {t(locale, "schedulerAdd")}
        </button>
      )}

      {showForm && (
        <div className="space-y-3 mb-4 p-4 border border-teal-200 rounded-xl bg-teal-50/30">
          <p className="text-sm font-medium text-foreground truncate">{pinTitle}</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-muted mb-1">{t(locale, "schedulerDate")}</label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-muted mb-1">{t(locale, "schedulerTime")}</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSchedule}
              disabled={!date || !time}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t(locale, "schedulerSchedule")}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-border text-muted text-sm hover:text-foreground transition-colors"
            >
              {t(locale, "reset")}
            </button>
          </div>
        </div>
      )}

      {/* Scheduled pins queue */}
      {scheduledPins.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">{t(locale, "schedulerQueue")}</h3>
          {scheduledPins.map((pin) => (
            <div
              key={pin.id}
              className="flex items-center justify-between gap-3 px-4 py-3 bg-accent rounded-xl"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{pin.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Calendar className="w-3 h-3" />
                  {pin.scheduledDate}
                  <Clock className="w-3 h-3" />
                  {pin.scheduledTime}
                </div>
              </div>
              <button
                onClick={() => handleRemove(pin.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-600 transition-colors shrink-0"
                title={t(locale, "schedulerRemove")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : !showForm && (
        <p className="text-sm text-muted text-center py-4">{t(locale, "schedulerEmpty")}</p>
      )}
    </div>
  );
}
