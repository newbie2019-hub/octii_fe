import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStudySession, useDueCount, sessionStorage } from "@/features/study-session";
import { PreStudyConfig } from "@/features/study-session/components/PreStudyConfig";
import { StudySessionCard } from "@/features/study-session/components/StudySessionCard";
import { SessionSummaryScreen } from "@/features/study-session/components/SessionSummaryScreen";
import { useDeck } from "@/features/deck";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { StudySessionConfig } from "@/features/study-session";
import type { StoredSession } from "@/features/study-session";

export default function StudySessionPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [recoverySession, setRecoverySession] = useState<StoredSession | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);

  const {
    state,
    startSession,
    flipCard,
    rateCard,
    exitSession,
    resetSession,
    getSessionSummary,
    checkRecoverableSession,
    syncPendingReviews,
  } = useStudySession();

  const { data: deck, isLoading: deckLoading, error: deckError } = useDeck(Number(deckId));

  // Fetch due count for remaining cards in summary
  const { data: dueData, refetch: refetchDue } = useDueCount(
    Number(deckId),
    state.config?.selectedTags?.length ? state.config.selectedTags : undefined
  );

  useEffect(() => {
    if (!deckId) {
      navigate("/decks");
    }
  }, [deckId, navigate]);

  // Check for recoverable session on mount
  useEffect(() => {
    if (deckId && state.session.status === "idle") {
      const recoveryInfo = checkRecoverableSession(Number(deckId));
      if (recoveryInfo.hasRecoverable && recoveryInfo.session) {
        setRecoverySession(recoveryInfo.session);
        setShowRecoveryDialog(true);
      }
    }
  }, [deckId, state.session.status, checkRecoverableSession]);

  // Handle abandoned session navigation
  useEffect(() => {
    if (state.session.status === "abandoned") {
      navigate(`/decks/${deckId}`);
    }
  }, [state.session.status, navigate, deckId]);

  // Refresh due count when session completes
  useEffect(() => {
    if (state.session.status === "complete") {
      refetchDue();
    }
  }, [state.session.status, refetchDue]);

  const handleStartSession = (config: StudySessionConfig) => {
    startSession(config);
  };

  const handleCancel = () => {
    navigate(`/decks/${deckId}`);
  };

  const handleExit = () => {
    exitSession();
    navigate(`/decks/${deckId}`);
  };

  const handleBackToDashboard = () => {
    resetSession();
    navigate("/dashboard");
  };

  const handleContinue = () => {
    if (state.config) {
      startSession(state.config);
    }
  };

  const handleResumeRecovery = async () => {
    if (!recoverySession || !deckId) return;

    // First sync any pending reviews
    await syncPendingReviews(Number(deckId));

    // Clear the recovery session
    sessionStorage.clear(Number(deckId));
    setShowRecoveryDialog(false);
    setRecoverySession(null);
  };

  const handleDiscardRecovery = () => {
    if (deckId) {
      sessionStorage.clear(Number(deckId));
    }
    setShowRecoveryDialog(false);
    setRecoverySession(null);
  };

  if (deckLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Deck not found</h1>
          <p className="mt-2 text-muted-foreground">
            The deck you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/decks")}
            className="mt-4 text-primary hover:underline"
          >
            Go back to decks
          </button>
        </div>
      </div>
    );
  }

  // Recovery dialog
  if (showRecoveryDialog && recoverySession) {
    const unsyncedCount = recoverySession.reviewQueue.filter(r => !r.synced).length;
    return (
      <div className="mx-auto max-w-md space-y-6 p-4 pt-20">
        <Card className="p-6">
          <div className="text-center mb-4">
            <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-bold">Resume Previous Session?</h2>
            <p className="text-muted-foreground mt-2">
              You have {unsyncedCount} unsubmitted review{unsyncedCount !== 1 ? 's' : ''} from a previous session.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(recoverySession.lastUpdatedAt).toLocaleString()}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResumeRecovery}
              className="w-full"
              size="lg"
            >
              Submit & Continue
            </Button>
            <Button
              onClick={handleDiscardRecovery}
              variant="outline"
              className="w-full"
            >
              Start Fresh
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Configuration screen
  if (
    state.session.status === "idle" ||
    state.session.status === "configuring"
  ) {
    return (
      <PreStudyConfig
        deckId={deck.id}
        deckName={deck.name}
        onStart={handleStartSession}
        onCancel={handleCancel}
      />
    );
  }

  // Loading screen
  if (state.session.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🎴</div>
          <p className="text-lg font-medium">Loading next card...</p>
        </div>
      </div>
    );
  }

  // Study session
  if (state.session.status === "studying" && state.session.currentCard) {
    return (
      <StudySessionCard
        card={state.session.currentCard}
        isFlipped={state.session.isFlipped}
        cardsReviewed={state.session.cardsReviewed}
        maxCards={state.config?.maxCards || 20}
        intervals={state.cache.intervals}
        streak={0} // TODO: Fetch from user streak API
        onFlip={flipCard}
        onRate={rateCard}
        onExit={handleExit}
      />
    );
  }

  // Session complete
  if (state.session.status === "complete") {
    const summary = getSessionSummary();
    const remainingDue = dueData?.total_available || 0;

    return (
      <SessionSummaryScreen
        summary={summary}
        deckName={deck.name}
        streak={0} // TODO: Fetch from user streak API
        remainingDue={remainingDue}
        onContinue={remainingDue > 0 ? handleContinue : undefined}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  // Abandoned session (navigation handled by useEffect)
  if (state.session.status === "abandoned") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">👋</div>
          <p className="text-lg font-medium">Returning to deck...</p>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Something went wrong</p>
        <button
          onClick={() => navigate("/decks")}
          className="mt-4 text-primary hover:underline"
        >
          Go back to decks
        </button>
      </div>
    </div>
  );
}

