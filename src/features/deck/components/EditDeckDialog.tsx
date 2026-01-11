import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateDeckSchema, type UpdateDeckFormValues } from '../schemas/deckSchema';
import { useUpdateDeck } from '../hooks/useUpdateDeck';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDeckStore } from '@/store/deckStore';
import type { Deck } from '../types/deck';
import { useEffect } from 'react';
import { TagSelector } from '@/features/tag';

interface EditDeckDialogProps {
  deck: Deck | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditDeckDialog({ deck, open, onOpenChange, onSuccess }: EditDeckDialogProps) {
  const { updateDeck, isUpdating } = useUpdateDeck();
  const { updateDeck: updateDeckInStore } = useDeckStore();

  const form = useForm<UpdateDeckFormValues>({
    resolver: zodResolver(updateDeckSchema),
    mode: 'onTouched',
    defaultValues: {
      name: deck?.name || '',
      description: deck?.description || '',
      tag_ids: deck?.tags?.map(tag => tag.id) || [],
    },
  });

  // Reset form when deck changes
  useEffect(() => {
    if (deck) {
      form.reset({
        name: deck.name,
        description: deck.description || '',
        tag_ids: deck.tags?.map(tag => tag.id) || [],
      });
    }
  }, [deck, form]);

  const onSubmit = async (data: UpdateDeckFormValues) => {
    if (!deck) return;

    try {
      const updatedDeck = await updateDeck(deck.id, data);
      updateDeckInStore(deck.id, updatedDeck);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error handled by hook
    }
  };

  if (!deck) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Deck</DialogTitle>
          <DialogDescription>
            Update the deck name and description.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Deck Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spanish Vocabulary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the deck..."
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
                      placeholder="Select or create tags..."
                      disabled={isUpdating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

