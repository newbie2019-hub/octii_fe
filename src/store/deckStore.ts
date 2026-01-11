import { create } from 'zustand';
import type { Deck } from '../features/deck/types/deck';

interface DeckStore {
  selectedDeck: Deck | null;
  decks: Deck[];
  setSelectedDeck: (deck: Deck | null) => void;
  setDecks: (decks: Deck[]) => void;
  addDeck: (deck: Deck) => void;
  updateDeck: (id: number, deck: Deck) => void;
  removeDeck: (id: number) => void;
  clearDecks: () => void;
}

export const useDeckStore = create<DeckStore>((set) => ({
  selectedDeck: null,
  decks: [],

  setSelectedDeck: (deck) => set({ selectedDeck: deck }),

  setDecks: (decks) => set({ decks }),

  addDeck: (deck) => set((state) => ({
    decks: [deck, ...state.decks],
  })),

  updateDeck: (id, deck) => set((state) => ({
    decks: state.decks.map((d) => (d.id === id ? deck : d)),
    selectedDeck: state.selectedDeck?.id === id ? deck : state.selectedDeck,
  })),

  removeDeck: (id) => set((state) => ({
    decks: state.decks.filter((d) => d.id !== id),
    selectedDeck: state.selectedDeck?.id === id ? null : state.selectedDeck,
  })),

  clearDecks: () => set({ decks: [], selectedDeck: null }),
}));

