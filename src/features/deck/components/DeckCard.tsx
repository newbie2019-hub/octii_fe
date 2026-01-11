import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Play,
  Plus,
  ChevronRight,
} from "lucide-react"
import type { Deck } from "../types/deck"
import { cn } from "@/lib/utils"

interface DeckCardProps {
  deck: Deck
  onEdit?: (deck: Deck) => void
  onDelete?: (deck: Deck) => void
  onStudy?: (deck: Deck) => void
  onAddCard?: (deck: Deck) => void
  depth?: number
}

export function DeckCard({
  deck,
  onEdit,
  onDelete,
  onStudy,
  onAddCard,
  depth = 0,
}: DeckCardProps) {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = deck.children && deck.children.length > 0
  const masteryPercentage = deck.mastery_percentage ?? 0

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "relative overflow-hidden rounded-md border bg-card",
          depth > 0 && "border-l-4 border-l-violet-500/30",
        )}
      >
        <div className="flex items-center gap-5 p-5">
          {/* Expand/Collapse button for nested decks */}
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-muted transition-colors"
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-90",
                )}
              />
            </button>
          )}

          {/* Deck icon/image */}
          <div className="shrink-0 w-14 h-14 rounded-sm bg-gradient-to-br from-rose-100 to-amber-50 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8"
              fill="none"
            >
              {/* Stack of books illustration */}
              <rect
                x="4"
                y="14"
                width="16"
                height="3"
                rx="0.5"
                fill="#f87171"
              />
              <rect
                x="4"
                y="10"
                width="16"
                height="3"
                rx="0.5"
                fill="#60a5fa"
              />
              <rect
                x="4"
                y="6"
                width="16"
                height="3"
                rx="0.5"
                fill="#a78bfa"
              />
            </svg>
          </div>

          {/* Title and description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {deck.name}
              </h3>
              {hasChildren && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {deck.children_count} sub-deck
                  {deck.children_count !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {deck.description && (
              <div
                className="text-sm text-muted-foreground mt-0.5 line-clamp-1"
                dangerouslySetInnerHTML={{ __html: deck.description }}
              ></div>
            )}
            <p className="text-xs text-muted-foreground/70 mt-1">
              Added on{" "}
              {new Date(deck.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            {deck.tags && deck.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {deck.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: `${tag.color}10`,
                      color: tag.color,
                      textShadow: "0 0 0.5px currentColor",
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
                {deck.tags.length > 4 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                    +{deck.tags.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* New cards count */}
          <div className="text-center w-24 shrink-0">
            <div className="text-xl font-bold text-green-600">
              {deck.new_count}
            </div>
            <div className="text-xs text-muted-foreground">New Cards</div>
          </div>

          {/* Total cards count */}
          <div className="text-center w-20 shrink-0">
            <div className="text-xl font-bold text-foreground">
              {deck.cards_count}
            </div>
            <div className="text-xs text-muted-foreground">Cards</div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 h-8 px-3"
              onClick={() => onStudy?.(deck)}
            >
              <Play className="h-3.5 w-3.5" />
              Study
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 h-8 px-3"
              onClick={() => onAddCard?.(deck)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add card
            </Button>
          </div>

          {/* Dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/decks/${deck.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Deck
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(deck)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(deck)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress bar at bottom */}
        <div className="h-1 bg-muted/50">
          <div
            className="h-full bg-violet-500 transition-all duration-300"
            style={{ width: `${masteryPercentage}%` }}
          />
        </div>
      </div>

      {/* Nested children decks */}
      {hasChildren && isExpanded && (
        <div className="ml-8 mt-2 flex flex-col gap-2 border-l-2 border-muted pl-4">
          {deck.children.map((childDeck) => (
            <DeckCard
              key={childDeck.id}
              deck={childDeck}
              onEdit={onEdit}
              onDelete={onDelete}
              onStudy={onStudy}
              onAddCard={onAddCard}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
