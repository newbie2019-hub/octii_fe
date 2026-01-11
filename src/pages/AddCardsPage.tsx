import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { useDeck } from "@/features/deck/hooks/useDeck"
import { useCreateCard } from "@/features/card/hooks/useCreateCard"
import {
  BasicCardEditor,
  ClozeCardEditor,
  ImageOcclusionEditor,
} from "@/features/deck/components/card-editors"
import { WizardCardsSidebar } from "@/features/deck/components/WizardCardsSidebar"
import {
  CARD_TYPES,
  type WizardCardType,
} from "@/features/deck/schemas/wizardSchema"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Plus,
  Loader2,
  Check,
  Layers,
  BracesIcon,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react"
import type { Card, OcclusionZone, MediaType, PendingMediaFile } from "@/features/card/types/card"

// Media file for basic cards
interface MediaFile {
  file?: File
  url: string
  mediaType: MediaType
  filename?: string
  previewUrl?: string
}

interface CreatedCard extends Card {
  tempId?: string
}

// Card type icons
const CardTypeIcons = {
  basic: Layers,
  cloze: BracesIcon,
  image_occlusion: ImageIcon,
} as const

export function AddCardsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const deckId = id ? Number(id) : undefined

  const {
    data: deck,
    isLoading: isLoadingDeck,
    error: deckError,
    refresh: refreshDeck,
  } = useDeck(deckId)

  const { mutateWithMedia, isPending: isCreatingCard } = useCreateCard(deckId ?? 0)

  // Cards created in this session
  const [cards, setCards] = useState<CreatedCard[]>([])
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  const [editingCardId, setEditingCardId] = useState<number | null>(null)

  // Card type state
  const [cardType, setCardType] = useState<WizardCardType>("basic")

  // Basic card state
  const [frontValue, setFrontValue] = useState("")
  const [backValue, setBackValue] = useState("")
  const [frontMedia, setFrontMedia] = useState<MediaFile | null>(null)
  const [backMedia, setBackMedia] = useState<MediaFile | null>(null)

  // Cloze card state
  const [clozeContent, setClozeContent] = useState("")

  // Image occlusion state
  const [occlusionImageUrl, setOcclusionImageUrl] = useState<string | null>(null)
  const [occlusionFilename, setOcclusionFilename] = useState<string | null>(null)
  const [occlusionZones, setOcclusionZones] = useState<OcclusionZone[]>([])

  // Get the editing card from the editingCardId
  const editingCard = useMemo(
    () => cards.find((c) => c.id === editingCardId) ?? null,
    [cards, editingCardId]
  )

  // Check if form is valid for submission
  const canSubmit = useMemo(() => {
    if (isCreatingCard) return false

    switch (cardType) {
      case "basic": {
        const hasFrontContent = frontValue.trim() || frontMedia
        const hasBackContent = backValue.trim() || backMedia
        return hasFrontContent && hasBackContent
      }
      case "cloze":
        return /\{\{c\d+::[^}]+\}\}/.test(clozeContent)
      case "image_occlusion":
        return occlusionImageUrl && occlusionZones.length > 0
      default:
        return false
    }
  }, [
    cardType,
    frontValue,
    backValue,
    frontMedia,
    backMedia,
    clozeContent,
    occlusionImageUrl,
    occlusionZones,
    isCreatingCard,
  ])

  const resetForm = useCallback(() => {
    setFrontValue("")
    setBackValue("")
    setFrontMedia(null)
    setBackMedia(null)
    setClozeContent("")
    setOcclusionImageUrl(null)
    setOcclusionFilename(null)
    setOcclusionZones([])
  }, [])

  const handleSubmitCard = async () => {
    if (!canSubmit || !deckId) return

    let front = ""
    let back = ""
    const pendingMediaFiles: PendingMediaFile[] = []

    switch (cardType) {
      case "basic":
        front = frontMedia ? `[media:${frontMedia.filename}]` : frontValue
        back = backMedia ? `[media:${backMedia.filename}]` : backValue

        if (frontMedia?.file) {
          pendingMediaFiles.push({
            file: frontMedia.file,
            media_type: frontMedia.mediaType,
            side: "front",
            position: 0,
            previewUrl: frontMedia.previewUrl,
          })
        }
        if (backMedia?.file) {
          pendingMediaFiles.push({
            file: backMedia.file,
            media_type: backMedia.mediaType,
            side: "back",
            position: 0,
            previewUrl: backMedia.previewUrl,
          })
        }
        break

      case "cloze":
        front = clozeContent
        back = ""
        break

      case "image_occlusion":
        front = JSON.stringify({
          type: "image_occlusion",
          zones: occlusionZones,
          image: occlusionFilename,
        })
        back = occlusionImageUrl || ""
        break
    }

    if (editingCard) {
      // Update existing card in local state
      setCards((prev) =>
        prev.map((c) =>
          c.id === editingCard.id
            ? { ...c, front, back, card_type: cardType }
            : c
        )
      )
      setEditingCardId(null)
      resetForm()
      toast.success("Card updated")
    } else {
      // Create new card
      try {
        const response = await mutateWithMedia(
          {
            front,
            back,
            card_type: cardType,
          },
          pendingMediaFiles
        )

        if (response?.data) {
          setCards((prev) => [...prev, response.data])
          resetForm()
        }
      } catch {
        // Error handled by hook
      }
    }
  }

  // Populate form when editingCardId changes
  const prevEditingCardIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (editingCardId !== prevEditingCardIdRef.current && editingCard) {
      prevEditingCardIdRef.current = editingCardId
      const type = (editingCard.card_type as WizardCardType) || "basic"
      setCardType(type)
      switch (type) {
        case "basic":
          setFrontValue(editingCard.front)
          setBackValue(editingCard.back)
          break
        case "cloze":
          setClozeContent(editingCard.front)
          break
        case "image_occlusion":
          try {
            const data = JSON.parse(editingCard.front)
            setOcclusionZones(data.zones || [])
            setOcclusionImageUrl(editingCard.back)
          } catch {
            setFrontValue(editingCard.front)
            setBackValue(editingCard.back)
          }
          break
      }
    } else if (editingCardId === null) {
      prevEditingCardIdRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingCardId])

  const handleCancelEdit = () => {
    setEditingCardId(null)
    resetForm()
  }

  const handleImageOcclusionChange = (
    url: string | null,
    filename: string | null
  ) => {
    setOcclusionImageUrl(url)
    setOcclusionFilename(filename)
  }

  const handleSidebarCardSelect = useCallback((index: number) => {
    setSelectedCardIndex(index)
  }, [])

  const handleSidebarCardEdit = useCallback((card: CreatedCard) => {
    setEditingCardId(card.id)
  }, [])

  const handleSidebarCardDelete = useCallback(
    (cardId: number) => {
      setCards((prev) => prev.filter((c) => c.id !== cardId))
      if (editingCardId === cardId) {
        setEditingCardId(null)
      }
      toast.success("Card removed from list")
    },
    [editingCardId]
  )

  const handleFinish = () => {
    refreshDeck()
    toast.success(
      `Added ${cards.length} card${cards.length !== 1 ? "s" : ""} to ${deck?.name}`
    )
    navigate(`/decks/${deckId}`)
  }

  const handleBack = () => {
    navigate(`/decks/${deckId}`)
  }

  // Loading state
  if (isLoadingDeck && !deck) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (deckError || !deck) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center py-20">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load deck</h3>
          <p className="text-muted-foreground mb-4">
            The deck may have been deleted or you don't have access to it.
          </p>
          <Button variant="outline" onClick={() => navigate("/decks")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Decks
          </Button>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-background flex flex-col w-full">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <button
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Deck
                </button>
              </div>
              <nav className="flex items-center gap-2 text-sm">
                <Link
                  to="/decks"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Decks
                </Link>
                <span className="text-muted-foreground">/</span>
                <Link
                  to={`/decks/${deckId}`}
                  className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[150px]"
                >
                  {deck.name}
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="text-foreground font-medium">Add Cards</span>
              </nav>
              <div className="w-20" />
            </div>
          </div>
        </div>

        {/* Sidebar + Content area */}
        <div className="flex flex-1 min-h-0">
          <WizardCardsSidebar
            cards={cards}
            selectedCardIndex={selectedCardIndex}
            onCardSelect={handleSidebarCardSelect}
            onCardEdit={handleSidebarCardEdit}
            onCardDelete={handleSidebarCardDelete}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto max-w-2xl px-6 py-8">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight mb-2">
                  Add Cards
                </h1>
                <p className="text-muted-foreground">
                  Create flashcards for{" "}
                  <span className="font-medium text-foreground">{deck.name}</span>
                </p>
              </div>

              <div className="space-y-6">
                {/* Card Type Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Card Type</Label>
                  <Select
                    value={cardType}
                    onValueChange={(value: WizardCardType) => {
                      if (!editingCard) {
                        setCardType(value)
                        resetForm()
                      }
                    }}
                    disabled={!!editingCard}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARD_TYPES.map((type) => {
                        const Icon =
                          CardTypeIcons[type.value as keyof typeof CardTypeIcons]
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-md bg-muted">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="font-medium">{type.label}</span>
                                <span className="text-muted-foreground ml-2 text-xs">
                                  {type.description}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Card Editor based on type */}
                <div className="border rounded-xl p-6 bg-card">
                  {cardType === "basic" && (
                    <BasicCardEditor
                      frontValue={frontValue}
                      backValue={backValue}
                      onFrontChange={setFrontValue}
                      onBackChange={setBackValue}
                      frontMedia={frontMedia}
                      backMedia={backMedia}
                      onFrontMediaChange={setFrontMedia}
                      onBackMediaChange={setBackMedia}
                      disabled={isCreatingCard}
                    />
                  )}

                  {cardType === "cloze" && (
                    <ClozeCardEditor
                      value={clozeContent}
                      onChange={setClozeContent}
                      disabled={isCreatingCard}
                    />
                  )}

                  {cardType === "image_occlusion" && (
                    <ImageOcclusionEditor
                      imageUrl={occlusionImageUrl}
                      zones={occlusionZones}
                      onImageChange={handleImageOcclusionChange}
                      onZonesChange={setOcclusionZones}
                      disabled={isCreatingCard}
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <Button type="button" variant="outline" onClick={handleFinish}>
                    {cards.length === 0 ? "Done" : `Done (${cards.length} added)`}
                  </Button>

                  <div className="flex items-center gap-2">
                    {editingCard && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={handleSubmitCard}
                      disabled={!canSubmit}
                    >
                      {isCreatingCard ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingCard ? "Saving..." : "Adding..."}
                        </>
                      ) : editingCard ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Card
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default AddCardsPage

