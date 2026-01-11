import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useDeleteCard } from '../hooks/useDeleteCard';
import type { Card } from '../types/card';

interface DeleteCardDialogProps {
  deckId: number;
  card: Card;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteCardDialog({ deckId, card, open, onOpenChange, onSuccess }: DeleteCardDialogProps) {
  const { mutate: deleteCard, isPending } = useDeleteCard(deckId);

  const handleDelete = () => {
    deleteCard(card.id, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Card</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this card? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="bg-muted p-4 rounded-md my-4">
          <p className="text-sm font-medium">Front:</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{card.front}</p>
          <p className="text-sm font-medium mt-2">Back:</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{card.back}</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

