import { useEffect, useState } from "react"
import { useDecks, type Deck } from "@/features/deck"
import { CardList } from "@/features/card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import octiiSad from "@/assets/images/octii_sad.png"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export function CardsPage() {
  const navigate = useNavigate()
  const { decks, isLoading: isLoadingDecks, fetchDecks } = useDecks()
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null)

  useEffect(() => {
    const loadDecks = async () => {
      await fetchDecks()
    }
    loadDecks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-select first deck if available and no deck is selected
  const firstDeck = decks[0]
  useEffect(() => {
    if (firstDeck && !selectedDeckId) {
      setSelectedDeckId(firstDeck.id)
    }
  }, [firstDeck, selectedDeckId])

  const selectedDeck = decks.find((d: Deck) => d.id === selectedDeckId)

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Cards</h1>
        <p className="text-muted-foreground mt-2">
          Browse and manage your flashcards
        </p>
      </div>

      {/* Deck Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select a Deck</CardTitle>
          <CardDescription>
            Choose a deck to view and manage its cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDecks ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading decks...</span>
            </div>
          ) : decks.length === 0 ? (
            <div className="text-center py-8">
              <img
                src={octiiSad}
                alt="No decks"
                className="mx-auto h-32 w-32 mb-6 opacity-80"
              />
              <h3 className="text-lg font-semibold mb-2">No decks yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a deck first to add cards
              </p>
              <Button onClick={() => navigate("/decks")}>Go to Decks</Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Select
                value={selectedDeckId?.toString()}
                onValueChange={(value: string) =>
                  setSelectedDeckId(Number(value))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a deck" />
                </SelectTrigger>
                <SelectContent>
                  {decks.map((deck: Deck) => (
                    <SelectItem
                      key={deck.id}
                      value={deck.id.toString()}
                    >
                      {deck.name} ({deck.cards_count || 0} cards)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDeck?.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedDeck.description}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card List */}
      {selectedDeckId && <CardList deckId={selectedDeckId} />}
    </div>
  )
}
