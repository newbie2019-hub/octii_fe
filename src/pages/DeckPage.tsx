import { useState, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useDeck } from "@/features/deck/hooks/useDeck"
import { useUpdateDeck } from "@/features/deck/hooks/useUpdateDeck"
import { uploadService } from "@/common/services/uploadService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Loader2,
  Play,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Upload,
  MoreHorizontal,
  ChevronRight,
  Layers,
} from "lucide-react"
import {
  EditDeckDialog,
  DeleteDeckDialog,
  DeckStackedCard,
} from "@/features/deck"
import type { Deck } from "@/features/deck"
import {
  ImportDeckDialog,
  ImportProgressWidget,
  useImport,
} from "@/features/import"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DeckPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    data: deck,
    isLoading,
    error,
    refresh,
  } = useDeck(id ? Number(id) : undefined)

  // Import hook for progress widget
  const { currentImport, resetImport } = useImport({ onComplete: refresh })

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)

  const { updateDeck } = useUpdateDeck()

  const handleDeckDeleted = () => {
    navigate("/decks")
  }

  const handleCoverChange = useCallback(
    async (file: File) => {
      if (!deck) return

      setIsUploadingCover(true)
      try {
        // Step 1: Upload to temp storage
        const uploadResponse = await uploadService.uploadToTemp(file, "image")

        // Step 2: Update deck with the temp filename
        await updateDeck(deck.id, {
          name: deck.name,
          cover: uploadResponse.data.filename,
        })

        // Refresh to get the new cover URL
        refresh()
      } catch {
        toast.error("Failed to update cover photo")
      } finally {
        setIsUploadingCover(false)
      }
    },
    [deck, updateDeck, refresh],
  )

  // Format relative time
  const getRelativeTime = (date: string | null) => {
    if (!date) return "Never"
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return "Just now"
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    return then.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (isLoading && !deck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load deck</h3>
          <p className="text-muted-foreground mb-4">
            The deck may have been deleted or you don't have access to it.
          </p>
          <Button
            variant="outline"
            asChild
          >
            <Link to="/decks">Back to Decks</Link>
          </Button>
        </div>
      </div>
    )
  }

  const formattedCreatedAt = new Date(deck.created_at).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  )

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/decks"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        ← Back to all decks
      </Link>

      {/* Hero Section */}
      <div className="flex flex-col items-center lg:flex-row lg:items-start gap-10 lg:gap-14 mb-12">
        {/* Stacked Cards */}
        <DeckStackedCard
          coverUrl={(deck as { cover_url?: string }).cover_url}
          deckName={deck.name}
          dueCount={deck.due_count}
          totalCards={deck.cards_count}
          onCoverChange={handleCoverChange}
          isUploadingCover={isUploadingCover}
        />

        {/* Deck Info */}
        <div className="flex-1 pt-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {deck.name}
          </h1>

          {deck.description && (
            <p className="text-base text-muted-foreground mb-4">
              {deck.description}
            </p>
          )}

          {/* Tags */}
          {deck.tags && deck.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {deck.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  style={{
                    backgroundColor: tag.color ? `${tag.color}20` : undefined,
                    color: tag.color || undefined,
                    borderColor: tag.color ? `${tag.color}40` : undefined,
                  }}
                  className="border"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Created
              </p>
              <p className="text-sm text-foreground font-medium">
                {formattedCreatedAt}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Last Studied
              </p>
              <p className="text-sm text-foreground font-medium">
                {getRelativeTime(deck.last_studied_at)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="rounded-xl font-semibold bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25"
              onClick={() => navigate(`/decks/${deck.id}/study`)}
            >
              <Play className="mr-2 h-5 w-5" />
              Start Studying
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
              >
                <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Cards
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/decks/${deck.id}/add-cards`)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Cards
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Deck
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Deck
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Child Decks Section */}
      {deck.children && deck.children.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Sub-decks</h2>
            <span className="text-sm text-muted-foreground">
              ({deck.children.length})
            </span>
          </div>

          <div className="space-y-2">
            {deck.children.map((childDeck: Deck) => (
              <Link
                key={childDeck.id}
                to={`/decks/${childDeck.id}`}
                className="group flex items-center justify-between p-4 bg-card hover:bg-accent/50 border rounded-xl transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {childDeck.name}
                  </h3>
                  {childDeck.description && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {childDeck.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6 ml-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-500">
                      {childDeck.due_count} due
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {childDeck.cards_count} cards
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ImportDeckDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={refresh}
      />

      <EditDeckDialog
        deck={deck}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={refresh}
      />

      <DeleteDeckDialog
        deck={deck}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeckDeleted}
      />

      {/* Import Progress Widget */}
      <ImportProgressWidget
        importData={currentImport}
        onDismiss={resetImport}
      />
    </div>
  )
}
