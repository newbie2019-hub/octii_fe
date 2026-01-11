import { useEffect, useState, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useDecks } from "@/features/deck/hooks/useDecks"
import { useDeckStore } from "@/store/deckStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DeckCard,
  CreateDeckDialog,
  EditDeckDialog,
  DeleteDeckDialog,
  DeckFiltersDialog,
  type Deck,
  type DeckFilterParams,
} from "@/features/deck"
import { ImportDeckDialog, ImportProgressWidget, useImport } from "@/features/import"
import {
  Plus,
  Search,
  Loader2,
  FolderPlus,
  SlidersHorizontal,
  Upload,
  Wand2,
} from "lucide-react"
import octiiSad from "@/assets/images/octii_sad.png"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDebounce } from "@/common/hooks/useDebounce"

export default function DecksPage() {
  const navigate = useNavigate()
  const {
    decks,
    meta,
    isLoading,
    hasNextPage,
    fetchDecks,
    fetchNextPage,
    refresh,
  } = useDecks()
  const { setDecks } = useDeckStore()

  // Import hook for progress widget
  const { currentImport, resetImport } = useImport({ onComplete: refresh })

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<DeckFilterParams>({})
  const debouncedSearch = useDebounce(searchQuery, 400)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)

  // Infinite scroll sentinel ref
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Count active filters (excluding search)
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      key !== "search" && value !== undefined && value !== null && value !== "",
  ).length

  // Fetch decks when search or filters change
  useEffect(() => {
    const params: DeckFilterParams = { ...filters }
    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim()
    }
    fetchDecks(params)
  }, [debouncedSearch, filters, fetchDecks])

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasNextPage && !isLoading) {
          fetchNextPage()
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0,
      },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isLoading, fetchNextPage])

  // Update store when decks change
  useEffect(() => {
    if (decks.length > 0) {
      setDecks(decks)
    }
  }, [decks, setDecks])

  const handleApplyFilters = useCallback((newFilters: DeckFilterParams) => {
    setFilters(newFilters)
  }, [])

  const handleEditDeck = (deck: Deck) => {
    setSelectedDeck(deck)
    setEditDialogOpen(true)
  }

  const handleDeleteDeck = (deck: Deck) => {
    setSelectedDeck(deck)
    setDeleteDialogOpen(true)
  }

  const handleRefresh = () => {
    refresh()
  }

  const handleStudy = (deck: Deck) => {
    navigate(`/decks/${deck.id}/study`)
  }

  const handleAddCard = (deck: Deck) => {
    navigate(`/decks/${deck.id}/add-cards`)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Decks</h1>
            <p className="text-muted-foreground mt-1">
              Manage your flashcard decks, create new ones, or import from Anki
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import Deck
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Deck
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCreateDialogOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Empty Deck
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/decks/create')}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Deck with Cards
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search and Filter - only show when there are decks or active filters */}
        {(decks.length > 0 || searchQuery || activeFilterCount > 0) && (
          <div className="flex justify-end gap-2">
            <div className="relative max-w-md w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search decks..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFiltersDialogOpen(true)}
              className="relative shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading && decks.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : decks.length === 0 ? (
        <div className="text-center py-20">
          <img
            src={octiiSad}
            alt="No decks"
            className="mx-auto h-32 w-32 mb-6 opacity-80"
          />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery || activeFilterCount > 0
              ? "No decks found"
              : "No decks yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || activeFilterCount > 0
              ? "Try adjusting your search or filters"
              : "Create your first deck to get started"}
          </p>
          {!searchQuery && activeFilterCount === 0 && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Deck
            </Button>
          )}
          {(searchQuery || activeFilterCount > 0) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setFilters({})
              }}
            >
              Clear search & filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Deck List */}
          <div className="flex flex-col gap-3">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onEdit={handleEditDeck}
                onDelete={handleDeleteDeck}
                onStudy={handleStudy}
                onAddCard={handleAddCard}
              />
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          <div
            ref={loadMoreRef}
            className="flex justify-center py-8"
          >
            {isLoading && hasNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Stats */}
          {meta && (
            <div className="text-center text-sm text-muted-foreground">
              Showing {decks.length} of {meta.total} decks
              {!hasNextPage && decks.length > 0 && (
                <span className="block mt-1">You've reached the end</span>
              )}
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <ImportDeckDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={handleRefresh}
      />

      <CreateDeckDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleRefresh}
      />

      <EditDeckDialog
        deck={selectedDeck}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleRefresh}
      />

      <DeleteDeckDialog
        deck={selectedDeck}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleRefresh}
      />

      <DeckFiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        filters={filters}
        onApply={handleApplyFilters}
      />

      {/* Import Progress Widget */}
      <ImportProgressWidget
        importData={currentImport}
        onDismiss={resetImport}
      />
    </div>
  )
}
