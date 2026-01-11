import type { SessionSummary } from "../types/study-session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, Clock, Target, TrendingUp, ArrowRight } from "lucide-react";

interface SessionSummaryScreenProps {
  summary: SessionSummary;
  deckName: string;
  streak?: number;
  remainingDue?: number;
  onContinue?: () => void;
  onBackToDashboard: () => void;
}

export function SessionSummaryScreen({
  summary,
  deckName,
  streak = 0,
  remainingDue = 0,
  onContinue,
  onBackToDashboard,
}: SessionSummaryScreenProps) {
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const totalRatings = Object.values(summary.ratings).reduce(
    (sum, count) => sum + count,
    0
  );

  // Calculate performance message
  const getPerformanceMessage = () => {
    if (summary.accuracy >= 90) return { text: "Outstanding! 🌟", color: "text-green-500" };
    if (summary.accuracy >= 70) return { text: "Well done! 👏", color: "text-blue-500" };
    if (summary.accuracy >= 50) return { text: "Keep practicing! 💪", color: "text-amber-500" };
    return { text: "You'll get there! 🌱", color: "text-orange-500" };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="space-y-3 text-center pt-8">
        <div className="text-6xl animate-in zoom-in duration-300">🎉</div>
        <h1 className="text-3xl font-bold animate-in slide-in-from-bottom-4 duration-500 delay-100">
          Session Complete!
        </h1>
        <p className="text-muted-foreground animate-in slide-in-from-bottom-4 duration-500 delay-150">
          {deckName}
        </p>
        <p className={`text-lg font-medium ${performance.color} animate-in slide-in-from-bottom-4 duration-500 delay-200`}>
          {performance.text}
        </p>
      </div>

      {/* Streak Badge */}
      {streak > 0 && (
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 dark:border-orange-800 dark:from-orange-950 dark:to-amber-950 animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex items-center justify-center gap-3 text-orange-600 dark:text-orange-400">
            <Flame className="h-8 w-8 animate-pulse" />
            <div className="text-center">
              <div className="text-3xl font-bold">{streak}</div>
              <div className="text-sm font-medium">Day Streak 🔥</div>
            </div>
          </div>
        </Card>
      )}

      {/* Session Statistics */}
      <Card className="p-6 animate-in slide-in-from-bottom-4 duration-500 delay-300">
        <h2 className="mb-4 text-center text-lg font-semibold flex items-center justify-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Session Statistics
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {summary.cardsReviewed}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Cards</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatDuration(summary.sessionDuration)}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Time</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className={`text-2xl font-bold ${summary.accuracy >= 70 ? 'text-green-500' : summary.accuracy >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
              {summary.accuracy}%
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Accuracy</div>
          </div>
        </div>
      </Card>

      {/* Rating Breakdown */}
      <Card className="p-6 animate-in slide-in-from-bottom-4 duration-500 delay-400">
        <h2 className="mb-4 text-center text-lg font-semibold">
          Rating Breakdown
        </h2>
        <div className="space-y-3">
          {[
            { rating: 1, label: "Again", color: "bg-red-500", emoji: "🔴" },
            { rating: 2, label: "Hard", color: "bg-orange-500", emoji: "🟠" },
            { rating: 3, label: "Good", color: "bg-green-500", emoji: "🟢" },
            { rating: 4, label: "Easy", color: "bg-blue-500", emoji: "🔵" },
          ].map(({ rating, label, color, emoji }) => {
            const count = summary.ratings[rating as 1 | 2 | 3 | 4];
            const percentage =
              totalRatings > 0 ? (count / totalRatings) * 100 : 0;

            return (
              <div key={rating} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{emoji}</span>
                    <span className="font-medium">{label}</span>
                  </span>
                  <span className="font-bold tabular-nums">{count}</span>
                </div>
                <div className="relative h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${color} transition-all duration-700 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Actions */}
      <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500 delay-500">
        {remainingDue > 0 && onContinue && (
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full group bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            <span className="flex items-center gap-2">
              Continue Studying
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="ml-2 text-sm opacity-80 bg-white/20 px-2 py-0.5 rounded-full">
              {remainingDue} more
            </span>
          </Button>
        )}
        <Button
          onClick={onBackToDashboard}
          variant="outline"
          size="lg"
          className="w-full"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}



