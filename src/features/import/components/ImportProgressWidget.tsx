import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Loader2, X, FileArchive } from "lucide-react"
import type { Import } from "../types/import"
import { cn } from "@/lib/utils"

interface ImportProgressWidgetProps {
  importData: Import | null
  onDismiss?: () => void
}

export function ImportProgressWidget({
  importData,
  onDismiss,
}: ImportProgressWidgetProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [dismissedId, setDismissedId] = useState<number | null>(null)

  // Handle visibility animation
  useEffect(() => {
    if (
      importData &&
      (importData.status === "pending" || importData.status === "processing")
    ) {
      // Only show if not dismissed
      if (dismissedId !== importData.id) {
        setShouldRender(true)
        // Trigger animation after render
        requestAnimationFrame(() => {
          setIsVisible(true)
        })
      }
    } else if (importData?.status === "completed") {
      // Only show if not dismissed
      if (dismissedId !== importData.id) {
        // Ensure widget is visible first
        setShouldRender(true)
        requestAnimationFrame(() => {
          setIsVisible(true)
        })

        // Then hide after 3 seconds
        const timer = setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => {
            setShouldRender(false)
            setDismissedId(null)
          }, 300)
        }, 3000)
        return () => clearTimeout(timer)
      }
    } else if (importData?.status === "failed") {
      // Keep visible on failure until dismissed
      if (dismissedId !== importData.id) {
        setShouldRender(true)
        setIsVisible(true)
      }
    } else {
      setIsVisible(false)
      setTimeout(() => {
        setShouldRender(false)
      }, 300)
    }
  }, [importData, dismissedId])

  const handleDismiss = () => {
    if (importData) {
      setDismissedId(importData.id)
    }
    setIsVisible(false)
    setTimeout(() => {
      setShouldRender(false)
      onDismiss?.()
    }, 300)
  }

  if (!shouldRender || !importData) return null

  const getStatusConfig = () => {
    switch (importData.status) {
      case "pending":
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin text-amber-500" />,
          label: "Queued",
          bgClass: "bg-amber-500/10 border-amber-500/20",
          progressClass: "bg-amber-500",
        }
      case "processing":
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
          label: "Importing...",
          bgClass: "bg-blue-500/10 border-blue-500/20",
          progressClass: "bg-blue-500",
        }
      case "completed":
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          label: "Complete!",
          bgClass: "bg-green-500/10 border-green-500/20",
          progressClass: "bg-green-500",
        }
      case "failed":
        return {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
          label: "Failed",
          bgClass: "bg-red-500/10 border-red-500/20",
          progressClass: "bg-red-500",
        }
      default:
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          label: "Processing",
          bgClass: "bg-muted",
          progressClass: "bg-primary",
        }
    }
  }

  const config = getStatusConfig()
  const isActive =
    importData.status === "pending" || importData.status === "processing"

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-border/50 shadow-xl transition-all duration-300",
        "bg-white dark:bg-zinc-900",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-5 pb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
          <FileArchive className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium truncate">{importData.file_name}</p>
            <button
              onClick={handleDismiss}
              className="shrink-0 rounded-md p-1 hover:bg-muted/80 transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {config.icon}
            <span className="text-xs text-muted-foreground">{config.label}</span>
          </div>
        </div>
      </div>

      {/* Progress section */}
      {isActive && (
        <div className="px-5 pb-5">
          <Progress value={importData.progress} className="h-1.5" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>
              {importData.imported_cards ?? 0} / {importData.total_cards ?? "?"}{" "}
              cards
            </span>
            <span>{importData.progress}%</span>
          </div>
        </div>
      )}

      {/* Completed message */}
      {importData.status === "completed" && (
        <div className="px-5 pb-5">
          <p className="text-sm text-green-600 dark:text-green-400">
            Successfully imported {importData.imported_cards} cards
          </p>
        </div>
      )}

      {/* Error message */}
      {importData.status === "failed" && importData.error_message && (
        <div className="px-5 pb-5">
          <p className="text-sm text-red-600 dark:text-red-400 line-clamp-2">
            {importData.error_message}
          </p>
        </div>
      )}
    </div>
  )
}

