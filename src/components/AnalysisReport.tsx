"use client";

import {
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Layout,
} from "lucide-react";

interface AnalysisData {
  topicSummary: string;
  mainKeywords: string[];
  longTailKeywords: string[];
  trendingRelated: string[];
  targetAudience: string;
  competitionLevel: string;
  seasonality: string;
  recommendedBoardName: string;
  recommendedBoardDescription: string;
}

interface AnalysisReportProps {
  analysis: AnalysisData;
}

function CompetitionBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    low: "Низкая",
    medium: "Средняя",
    high: "Высокая",
  };
  const cls = colors[level] || colors.medium;
  const label = labels[level] || level;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export function AnalysisReport({ analysis }: AnalysisReportProps) {
  return (
    <div className="bg-card-bg rounded-2xl border border-border p-6 sm:p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            SEO-анализ
          </h2>
          <p className="text-sm text-muted">Результаты анализа ключевых слов</p>
        </div>
      </div>

      <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
        {analysis.topicSummary}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Target className="w-4 h-4 text-primary" />
            Основные ключевые слова
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.mainKeywords.map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 bg-primary/8 text-primary rounded-lg text-xs font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Длинные ключевые фразы
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.longTailKeywords.map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            Трендовые связанные темы
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.trendingRelated.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Users className="w-4 h-4 text-blue-600" />
            Целевая аудитория
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {analysis.targetAudience}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-muted block mb-1">Конкуренция</span>
            <CompetitionBadge level={analysis.competitionLevel} />
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-muted mb-1">
              <Calendar className="w-3 h-3" />
              Сезонность
            </div>
            <p className="text-xs text-foreground/80">{analysis.seasonality}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Layout className="w-4 h-4 text-orange-600" />
            Рекомендуемая доска
          </div>
          <p className="text-sm font-medium text-foreground">
            {analysis.recommendedBoardName}
          </p>
          <p className="text-xs text-muted leading-relaxed">
            {analysis.recommendedBoardDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
