import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteDeck } from '../hooks/useDeleteDeck';
import { useDeckStore } from '@/store/deckStore';
import type { Deck } from '../types/deck';

interface DeleteDeckDialogProps {
  deck: Deck | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteDeckDialog({ deck, open, onOpenChange, onSuccess }: DeleteDeckDialogProps) {
  const { deleteDeck, isDeleting } = useDeleteDeck();
  const { removeDeck } = useDeckStore();

  const handleDelete = async () => {
    if (!deck) return;

    try {
      await deleteDeck(deck.id);
      removeDeck(deck.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error handled by hook
    }
  };

  if (!deck) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the deck <strong>&quot;{deck.name}&quot;</strong> and all
            its cards ({deck.cards_count} {deck.cards_count === 1 ? 'card' : 'cards'}). This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isDeleting ? 'Deleting...' : 'Delete Deck'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

