import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  deckInfoSchema,
  type DeckInfoFormValues,
  type WizardCardType,
  CARD_TYPES,
} from "../schemas/wizardSchema"
import { useCreateDeck } from "../hooks/useCreateDeck"
import { useCreateCard } from "@/features/card/hooks/useCreateCard"
import { uploadService } from "@/common/services/uploadService"
import { useDeckStore } from "@/store/deckStore"
import { TagSelector } from "@/features/tag"
import {
  BasicCardEditor,
  ClozeCardEditor,
  ImageOcclusionEditor,
} from "./card-editors"
import { WizardCardsSidebar } from "./WizardCardsSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Plus,
  Loader2,
  Check,
  Layers,
  BracesIcon,
  Image as ImageIcon,
} from "lucide-react"
import type { Deck } from "../types/deck"
import type {
  Card,
  OcclusionZone,
  MediaType,
  PendingMediaFile,
} from "@/features/card/types/card"

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

export function DeckCreationWizard() {
  const navigate = useNavigate()
  const { createDeck, isCreating: isCreatingDeck } = useCreateDeck()
  const { addDeck } = useDeckStore()

  // Wizard state
  const [step, setStep] = useState<1 | 2>(1)
  const [createdDeck, setCreatedDeck] = useState<Deck | null>(null)
  const [cards, setCards] = useState<CreatedCard[]>([])
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [uploadedCoverFilename, setUploadedCoverFilename] = useState<
    string | null
  >(null)

  // Sidebar state (for step 2)
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null,
  )
  const [editingCardId, setEditingCardId] = useState<number | null>(null)

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
      toast.success("Card removed")
    },
    [editingCardId],
  )

  // Step 1 form
  const deckForm = useForm<DeckInfoFormValues>({
    resolver: zodResolver(deckInfoSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      description: "",
      tag_ids: [],
    },
  })

  const handleCoverUpload = useCallback(async (file: File) => {
    setIsUploadingCover(true)
    try {
      // Show preview immediately
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to temp storage
      const response = await uploadService.uploadToTemp(file, "image")
      setUploadedCoverFilename(response.data.filename)
      toast.success("Cover uploaded")
    } catch {
      setCoverPreview(null)
      toast.error("Failed to upload cover")
    } finally {
      setIsUploadingCover(false)
    }
  }, [])

  const handleRemoveCover = useCallback(async () => {
    if (uploadedCoverFilename) {
      try {
        await uploadService.deleteTempFile(uploadedCoverFilename)
      } catch {
        // Ignore cleanup errors
      }
    }
    setCoverPreview(null)
    setUploadedCoverFilename(null)
    deckForm.setValue("cover", undefined)
  }, [uploadedCoverFilename, deckForm])

  const handleStep1Submit = async (data: DeckInfoFormValues) => {
    try {
      const deckData = {
        name: data.name,
        description: data.description,
        tag_ids: data.tag_ids,
        ...(uploadedCoverFilename && { cover: uploadedCoverFilename }),
      }

      const deck = await createDeck(deckData)
      setCreatedDeck(deck)
      addDeck(deck)
      setStep(2)
    } catch {
      // Error handled by hook
    }
  }

  const handleFinish = () => {
    toast.success(
      `Deck created with ${cards.length} card${cards.length !== 1 ? "s" : ""}`,
    )
    navigate(`/decks/${createdDeck?.id}`)
  }

  const handleCancel = async () => {
    // Cleanup uploaded cover if we're on step 1
    if (step === 1 && uploadedCoverFilename) {
      try {
        await uploadService.deleteTempFile(uploadedCoverFilename)
      } catch {
        // Ignore cleanup errors
      }
    }
    navigate("/decks")
  }

  // Step 1: Regular layout without sidebar
  if (step === 1) {
    return (
      <div className="min-h-screen bg-background">
        {/* Progress indicator */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <button
                onClick={handleCancel}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <StepIndicator
                  step={1}
                  currentStep={step}
                  label="Deck Info"
                />
                <div className="w-12 h-px bg-border" />
                <StepIndicator
                  step={2}
                  currentStep={step}
                  label="Add Cards"
                />
              </div>
              <div className="w-20" /> {/* Spacer for centering */}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <Step1DeckInfo
            form={deckForm}
            onSubmit={handleStep1Submit}
            isSubmitting={isCreatingDeck}
            coverPreview={coverPreview}
            isUploadingCover={isUploadingCover}
            onCoverUpload={handleCoverUpload}
            onRemoveCover={handleRemoveCover}
          />
        </div>
      </div>
    )
  }

  // Step 2: Sidebar layout with cards list
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-background flex flex-col w-full">
        {/* Progress indicator - full width above sidebar */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <button
                  onClick={handleCancel}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </button>
              </div>
              <div className="flex items-center gap-3">
                <StepIndicator
                  step={1}
                  currentStep={step}
                  label="Deck Info"
                />
                <div className="w-12 h-px bg-border" />
                <StepIndicator
                  step={2}
                  currentStep={step}
                  label="Add Cards"
                />
              </div>
              <div className="w-20" /> {/* Spacer for centering */}
            </div>
          </div>
        </div>

        {/* Sidebar + Content area below nav */}
        <div className="flex flex-1 overflow-hidden">
          <WizardCardsSidebar
            cards={cards}
            selectedCardIndex={selectedCardIndex}
            onCardSelect={handleSidebarCardSelect}
            onCardEdit={handleSidebarCardEdit}
            onCardDelete={handleSidebarCardDelete}
          />

          <main className="flex-1 overflow-auto">
            <Step2CardCreation
              deck={createdDeck!}
              cards={cards}
              setCards={setCards}
              onFinish={handleFinish}
              editingCardId={editingCardId}
              setEditingCardId={setEditingCardId}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

interface StepIndicatorProps {
  step: number
  currentStep: number
  label: string
}

function StepIndicator({ step, currentStep, label }: StepIndicatorProps) {
  const isCompleted = currentStep > step
  const isCurrent = currentStep === step

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
          ${isCompleted ? "bg-primary text-primary-foreground" : ""}
          ${
            isCurrent
              ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
              : ""
          }
          ${!isCompleted && !isCurrent ? "bg-muted text-muted-foreground" : ""}
        `}
      >
        {isCompleted ? <Check className="h-4 w-4" /> : step}
      </div>
      <span
        className={`text-sm font-medium hidden sm:block ${
          isCurrent ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  )
}

interface Step1Props {
  form: ReturnType<typeof useForm<DeckInfoFormValues>>
  onSubmit: (data: DeckInfoFormValues) => void
  isSubmitting: boolean
  coverPreview: string | null
  isUploadingCover: boolean
  onCoverUpload: (file: File) => void
  onRemoveCover: () => void
}

function Step1DeckInfo({
  form,
  onSubmit,
  isSubmitting,
  coverPreview,
  isUploadingCover,
  onCoverUpload,
  onRemoveCover,
}: Step1Props) {
  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Create a New Deck
        </h1>
        <p className="text-muted-foreground">
          Start by giving your deck a name and adding some details
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Cover Upload */}
          <div className="space-y-2">
            <FormLabel>Cover Image (Optional)</FormLabel>
            <div className="flex items-start gap-4">
              <div
                className={`
                  relative w-32 h-32 rounded-xl border-2 border-dashed
                  flex items-center justify-center overflow-hidden
                  transition-all cursor-pointer group
                  ${
                    coverPreview
                      ? "border-transparent"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }
                `}
              >
                {coverPreview ? (
                  <>
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={onRemoveCover}
                      className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                    {isUploadingCover ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-xs text-muted-foreground mt-2">
                          Upload
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onCoverUpload(file)
                      }}
                      disabled={isUploadingCover}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex-1">
                Add a cover image to make your deck stand out. Recommended size:
                400x400px
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deck Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Japanese Vocabulary"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What's this deck about?"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tag_ids"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (Optional)</FormLabel>
                <FormControl>
                  <TagSelector
                    selectedTagIds={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Add tags to organize..."
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingCover}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

interface Step2Props {
  deck: Deck
  cards: CreatedCard[]
  setCards: React.Dispatch<React.SetStateAction<CreatedCard[]>>
  onFinish: () => void
  editingCardId: number | null
  setEditingCardId: React.Dispatch<React.SetStateAction<number | null>>
}

function Step2CardCreation({
  deck,
  cards,
  setCards,
  onFinish,
  editingCardId,
  setEditingCardId,
}: Step2Props) {
  const { mutateWithMedia, isPending: isCreatingCard } = useCreateCard(deck.id)

  // Get the editing card from the editingCardId
  const editingCard = useMemo(
    () => cards.find((c) => c.id === editingCardId) ?? null,
    [cards, editingCardId],
  )

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
  const [occlusionImageUrl, setOcclusionImageUrl] = useState<string | null>(
    null,
  )
  const [occlusionFilename, setOcclusionFilename] = useState<string | null>(
    null,
  )
  const [occlusionZones, setOcclusionZones] = useState<OcclusionZone[]>([])

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
        // Must have at least one cloze deletion
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
    if (!canSubmit) return

    let front = ""
    let back = ""
    const pendingMediaFiles: PendingMediaFile[] = []

    switch (cardType) {
      case "basic":
        front = frontMedia ? `[media:${frontMedia.filename}]` : frontValue
        back = backMedia ? `[media:${backMedia.filename}]` : backValue

        // Collect media files for upload
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
        back = "" // Back is auto-generated on the server based on cloze syntax
        break

      case "image_occlusion":
        // Store zones as JSON in front field
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
            : c,
        ),
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
          pendingMediaFiles,
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

  // Populate form when editingCardId changes (triggered from sidebar)
  const prevEditingCardIdRef = useRef<number | null>(null)

  useEffect(() => {
    // Only populate form when editingCardId changes and we have a card to edit
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
    filename: string | null,
  ) => {
    setOcclusionImageUrl(url)
    setOcclusionFilename(filename)
  }

  return (
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
        {/* Card Type Selector - Dropdown */}
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
                  <SelectItem
                    key={type.value}
                    value={type.value}
                  >
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
          <Button
            type="button"
            variant="outline"
            onClick={onFinish}
          >
            {cards.length === 0 ? "Skip & Finish" : "Finish"}
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
  )
}

export default DeckCreationWizard
