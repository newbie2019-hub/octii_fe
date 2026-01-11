import { useRef, useState } from "react"
import { Pencil, Loader2 } from "lucide-react"
import octiiSearch from "@/assets/images/octii_search.png"

// CSS for stacked card animations (one-time only)
// Phase 1: All cards drop together
// Phase 2: Back cards rotate to their final angles
const stackedCardStyles = `
  @keyframes cardDrop {
    0% {
      opacity: 0;
      transform: translateY(-30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes rotate1 {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(-4deg);
    }
  }

  @keyframes rotate2 {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(3deg);
    }
  }

  @keyframes rotate3 {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(-1.5deg);
    }
  }

  .card-stack-1 {
    animation:
      cardDrop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
      rotate1 0.3s ease-out 0.45s forwards;
    opacity: 0;
  }

  .card-stack-2 {
    animation:
      cardDrop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
      rotate2 0.3s ease-out 0.5s forwards;
    opacity: 0;
  }

  .card-stack-3 {
    animation:
      cardDrop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
      rotate3 0.3s ease-out 0.55s forwards;
    opacity: 0;
  }

  .card-stack-front {
    animation: cardDrop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    opacity: 0;
  }
`

interface DeckStackedCardProps {
  coverUrl?: string | null
  deckName: string
  dueCount: number
  totalCards: number
  onCoverChange?: (file: File) => Promise<void>
  isUploadingCover?: boolean
}

export function DeckStackedCard({
  coverUrl,
  deckName,
  dueCount,
  totalCards,
  onCoverChange,
  isUploadingCover = false,
}: DeckStackedCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleEditClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onCoverChange) {
      await onCoverChange(file)
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  return (
    <>
      <style>{stackedCardStyles}</style>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="relative w-[240px] h-[320px] sm:w-[280px] sm:h-[360px]">
        {/* Edit Cover Button - positioned above the front card */}
        {onCoverChange && (
          <button
            onClick={handleEditClick}
            disabled={isUploadingCover}
            className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Change cover photo"
          >
            {isUploadingCover ? (
              <Loader2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400 animate-spin" />
            ) : (
              <Pencil className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            )}
          </button>
        )}
        {/* Back card 1 - darker indigo */}
        <div
          className="card-stack-1 absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-500 dark:from-indigo-600 dark:to-indigo-700 rounded-xl border border-indigo-300 dark:border-indigo-500 shadow-md"
          style={{ zIndex: 1, transformOrigin: "center center" }}
        />
        {/* Back card 2 - darker blue */}
        <div
          className="card-stack-2 absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-600 dark:to-blue-700 rounded-xl border border-blue-300 dark:border-blue-500 shadow-md"
          style={{ zIndex: 2, transformOrigin: "center center" }}
        />
        {/* Back card 3 - darker slate */}
        <div
          className="card-stack-3 absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-500 dark:to-slate-600 rounded-xl border border-slate-200 dark:border-slate-400 shadow-md"
          style={{ zIndex: 3, transformOrigin: "center center" }}
        />
        {/* Front card */}
        <div
          className="card-stack-front absolute inset-0 bg-white/30 dark:bg-zinc-800/90 backdrop-blur-sm rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 shadow-xl flex flex-col overflow-hidden"
          style={{ zIndex: 4 }}
        >
          {/* Deck Cover Area */}
          {coverUrl ? (
            <div className="flex-1 overflow-hidden relative">
              <img
                src={coverUrl}
                alt={`${deckName} cover`}
                className="w-full h-full object-cover"
              />
              {isUploadingCover && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
              <img
                src={octiiSearch}
                alt="Octii mascot"
                className="max-w-full max-h-full object-contain"
              />
              {isUploadingCover && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 divide-x divide-zinc-200/50 dark:divide-zinc-700/50 border-t border-zinc-200/50 dark:border-zinc-700/50 bg-white/60 dark:bg-zinc-900/60">
            <div className="py-3 px-2 text-center">
              <p className="text-xl sm:text-2xl font-bold text-red-500">
                {dueCount}
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-medium">
                Due
              </p>
            </div>
            <div className="py-3 px-2 text-center">
              <p className="text-xl sm:text-2xl font-bold text-emerald-500">
                {totalCards}
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-medium">
                Total
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

