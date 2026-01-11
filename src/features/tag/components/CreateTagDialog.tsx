import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTagSchema, type CreateTagFormValues } from '../schemas/tagSchema';
import { useCreateTag } from '../hooks/useCreateTag';
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
import { ColorPicker } from '@/common/components/ColorPicker';
import type { Tag } from '../types/tag';

const DEFAULT_COLOR = '#3B82F6';

interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (tag: Tag) => void;
}

export function CreateTagDialog({ open, onOpenChange, onSuccess }: CreateTagDialogProps) {
  const { createTag, isCreating } = useCreateTag();

  const form = useForm<CreateTagFormValues>({
    resolver: zodResolver(createTagSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      color: DEFAULT_COLOR,
    },
  });

  const onSubmit = async (data: CreateTagFormValues) => {
    try {
      const tag = await createTag(data);
      form.reset({ name: '', color: DEFAULT_COLOR });
      onOpenChange(false);
      onSuccess?.(tag);
    } catch {
      // Error handled by hook
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset({ name: '', color: DEFAULT_COLOR });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create Tag</DialogTitle>
          <DialogDescription>
            Create a new tag to organize your decks and cards.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spanish, Vocabulary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <ColorPicker
                      value={field.value || DEFAULT_COLOR}
                      onChange={field.onChange}
                      disabled={isCreating}
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
                onClick={() => handleOpenChange(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Tag'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

