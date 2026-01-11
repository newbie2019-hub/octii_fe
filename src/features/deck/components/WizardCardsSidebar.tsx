import { useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSidebar } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Layers,
  BracesIcon,
  Image as ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Card } from "@/features/card/types/card"
import octiiNote from "@/assets/images/octii_note.png"

// Card type icons
const CardTypeIcons = {
  basic: Layers,
  cloze: BracesIcon,
  image_occlusion: ImageIcon,
} as const

interface CreatedCard extends Card {
  tempId?: string
}

interface WizardCardsSidebarProps {
  cards: CreatedCard[]
  selectedCardIndex: number | null
  onCardSelect: (index: number) => void
  onCardEdit: (card: CreatedCard) => void
  onCardDelete: (cardId: number) => void
}

export function WizardCardsSidebar({
  cards,
  selectedCardIndex,
  onCardSelect,
  onCardEdit,
  onCardDelete,
}: WizardCardsSidebarProps) {
  const { open } = useSidebar()

  return (
    <aside
      className={cn(
        "bg-sidebar border-r flex flex-col transition-all duration-200 ease-in-out shrink-0 overflow-hidden",
        open ? "w-64" : "w-0 border-r-0",
      )}
    >
      {/* Header */}
      <div className="border-b px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Cards
          </span>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {cards.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-6 py-16 h-full">
            <img
              src={octiiNote}
              alt="No cards"
              className="w-16 h-16 mb-4 opacity-50"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cards you create will appear here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {cards.map((card, index) => (
                <CardListItem
                  key={card.id}
                  card={card}
                  index={index}
                  isSelected={selectedCardIndex === index}
                  onClick={() => onCardSelect(index)}
                  onEdit={() => onCardEdit(card)}
                  onDelete={() => onCardDelete(card.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </aside>
  )
}

interface CardListItemProps {
  card: CreatedCard
  index: number
  isSelected: boolean
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

function CardListItem({
  card,
  index,
  isSelected,
  onClick,
  onEdit,
  onDelete,
}: CardListItemProps) {
  const Icon =
    CardTypeIcons[(card.card_type as keyof typeof CardTypeIcons) || "basic"] ||
    Layers

  // Get display text for card preview
  const previewText = useMemo(() => {
    if (card.card_type === "image_occlusion") {
      try {
        const data = JSON.parse(card.front)
        return `${data.zones?.length || 0} zones`
      } catch {
        return "Image Occlusion"
      }
    }
    if (card.card_type === "cloze") {
      // Show text without cloze markers
      return card.front.replace(/\{\{c\d+::([^}]+)\}\}/g, "[$1]").substring(0, 50)
    }
    // Strip HTML for basic cards
    return card.front.replace(/<[^>]*>/g, "").substring(0, 50)
  }, [card])

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
        "hover:bg-sidebar-accent",
        isSelected && "bg-sidebar-accent",
      )}
      onClick={onClick}
    >
      <div className="p-1.5 rounded-md bg-muted shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
          Card {index + 1}
        </p>
        <p className="text-sm font-medium truncate">{previewText || "Empty"}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "p-1 rounded-md transition-all",
              "opacity-0 group-hover:opacity-100 hover:bg-muted focus:opacity-100",
            )}
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default WizardCardsSidebar
