import { useEffect, useCallback } from "react";
import type { Card, IntervalPreviews } from "../types/study-session";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card as CardComponent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Flame, ChevronDown } from "lucide-react";
import { LatexRenderer } from "@/common/components/LatexRenderer";

interface StudySessionCardProps {
  card: Card;
  isFlipped: boolean;
  cardsReviewed: number;
  maxCards: number;
  intervals: IntervalPreviews | null;
  streak?: number;
  onFlip: () => void;
  onRate: (rating: 1 | 2 | 3 | 4) => void;
  onExit: () => void;
}

const RATING_CONFIG = {
  1: {
    label: "Again",
    color: "bg-red-500 hover:bg-red-600 text-white",
    emoji: "🔴",
  },
  2: {
    label: "Hard",
    color: "bg-orange-500 hover:bg-orange-600 text-white",
    emoji: "🟠",
  },
  3: {
    label: "Good",
    color: "bg-green-500 hover:bg-green-600 text-white",
    emoji: "🟢",
  },
  4: {
    label: "Easy",
    color: "bg-blue-500 hover:bg-blue-600 text-white",
    emoji: "🔵",
  },
} as const;

export function StudySessionCard({
  card,
  isFlipped,
  cardsReviewed,
  maxCards,
  intervals,
  streak = 0,
  onFlip,
  onRate,
  onExit,
}: StudySessionCardProps) {
  const progress = (cardsReviewed / maxCards) * 100;

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Space to flip
    if (e.key === " " && !isFlipped) {
      e.preventDefault();
      onFlip();
      return;
    }

    // 1-4 to rate when flipped
    if (!isFlipped) return;
    if (e.key === "1") onRate(1);
    else if (e.key === "2") onRate(2);
    else if (e.key === "3") onRate(3);
    else if (e.key === "4") onRate(4);
  }, [isFlipped, onFlip, onRate]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Exit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Exit study session?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your progress will be saved, but you'll end this session
                  early.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue studying</AlertDialogCancel>
                <AlertDialogAction onClick={onExit}>
                  Exit session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="text-sm font-medium">
            {cardsReviewed} / {maxCards}
          </div>

          {streak > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{streak}-day</span>
            </div>
          )}
        </div>
        <div className="mx-auto mt-2 max-w-4xl">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Front */}
          <CardComponent className="min-h-[250px] p-8 transition-all duration-300 hover:shadow-lg">
            <div className="flex min-h-[200px] flex-col items-center justify-center space-y-4">
              <div className="text-center text-xl sm:text-2xl font-medium leading-relaxed">
                <LatexRenderer content={card.front} />
              </div>
            </div>
          </CardComponent>

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {card.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Reveal Divider or Answer */}
          {!isFlipped ? (
            <Button
              onClick={onFlip}
              variant="outline"
              size="lg"
              className="w-full group transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
            >
              <span className="flex items-center gap-2">
                Tap to reveal
                <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </span>
            </Button>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">
                    Answer
                  </span>
                </div>
              </div>

              <CardComponent className="min-h-[250px] p-8 border-primary/20 bg-primary/5">
                <div className="flex min-h-[200px] flex-col items-center justify-center space-y-4">
                  <div className="text-center text-xl sm:text-2xl font-medium leading-relaxed">
                    <LatexRenderer content={card.back} />
                  </div>
                </div>
              </CardComponent>
            </div>
          )}

          {/* Rating Buttons */}
          {isFlipped && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-100">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {([1, 2, 3, 4] as const).map((rating, index) => (
                  <Button
                    key={rating}
                    onClick={() => onRate(rating)}
                    className={`${RATING_CONFIG[rating].color} transition-all duration-200 hover:scale-105 active:scale-95`}
                    size="lg"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">
                        {RATING_CONFIG[rating].emoji}
                      </span>
                      <span className="font-semibold">
                        {RATING_CONFIG[rating].label}
                      </span>
                      {intervals && (
                        <span className="text-xs opacity-90">
                          {
                            intervals[
                              RATING_CONFIG[rating].label.toLowerCase() as keyof IntervalPreviews
                            ]
                          }
                        </span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Keyboard: <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Space</kbd> to flip, <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">1-4</kbd> to rate
              </p>
            </div>
          )}

          {!isFlipped && (
            <p className="text-center text-xs text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Space</kbd> to reveal
            </p>
          )}
        </div>
      </div>
    </div>
  );
}



