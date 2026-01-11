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
import { useDeleteTag } from '../hooks/useDeleteTag';
import type { Tag } from '../types/tag';

interface DeleteTagDialogProps {
  tag: Tag | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteTagDialog({ tag, open, onOpenChange, onSuccess }: DeleteTagDialogProps) {
  const { deleteTag, isDeleting } = useDeleteTag();

  const handleDelete = async () => {
    if (!tag) return;

    try {
      await deleteTag(tag.id);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error handled by hook
    }
  };

  if (!tag) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Tag</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the tag{' '}
            <span
              className="inline-flex items-center gap-1.5 font-medium"
              style={{ color: tag.color }}
            >
              <span
                className="size-2.5 rounded-full inline-block"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </span>
            ? This tag will be removed from{' '}
            {tag.decks_count !== undefined && (
              <strong>{tag.decks_count} {tag.decks_count === 1 ? 'deck' : 'decks'}</strong>
            )}
            {tag.decks_count !== undefined && tag.cards_count !== undefined && ' and '}
            {tag.cards_count !== undefined && (
              <strong>{tag.cards_count} {tag.cards_count === 1 ? 'card' : 'cards'}</strong>
            )}
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Tag'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

