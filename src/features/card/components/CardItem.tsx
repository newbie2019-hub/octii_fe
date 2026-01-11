import type { Card as CardType } from "../types/card"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LatexRenderer } from "@/common/components/LatexRenderer"
import {
  Edit2,
  Trash2,
  Pause,
  Play,
  FileAudio,
  FileImage,
  FileVideo,
} from "lucide-react"

interface CardItemProps {
  card: CardType
  onEdit?: (card: CardType) => void
  onDelete?: (card: CardType) => void
  onToggleSuspend?: (card: CardType) => void
}

export function CardItem({
  card,
  onEdit,
  onDelete,
  onToggleSuspend,
}: CardItemProps) {
  const mediaIcons = {
    image: <FileImage className="h-4 w-4" />,
    audio: <FileAudio className="h-4 w-4" />,
    video: <FileVideo className="h-4 w-4" />,
  }

  const isSuspended = card.suspended_at !== null

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${
        isSuspended ? "opacity-60 border-muted" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isSuspended && (
                <Badge
                  variant="outline"
                  className="text-xs border-yellow-500 text-yellow-700 dark:text-yellow-400"
                >
                  Suspended
                </Badge>
              )}
              {card.card_type && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                >
                  {card.card_type}
                </Badge>
              )}
              {card.media && card.media.length > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  <div className="flex items-center gap-1">
                    {mediaIcons[card.media[0].media_type]}
                    {card.media.length > 1 && (
                      <span>+{card.media.length - 1}</span>
                    )}
                  </div>
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onToggleSuspend && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleSuspend(card)}
                title={isSuspended ? "Unsuspend card" : "Suspend card"}
              >
                {isSuspended ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(card)}
                title="Edit card"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(card)}
                title="Delete card"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
            Front
          </p>
          <div className="text-sm line-clamp-3">
            <LatexRenderer content={card.front} />
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
            Back
          </p>
          <div className="text-sm line-clamp-3">
            <LatexRenderer content={card.back} />
          </div>
        </div>
        {card.external_id && (
          <p className="text-xs text-muted-foreground">
            External ID: {card.external_id}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
