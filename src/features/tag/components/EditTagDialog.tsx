import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateTagSchema, type UpdateTagFormValues } from '../schemas/tagSchema';
import { useUpdateTag } from '../hooks/useUpdateTag';
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
import { useEffect } from 'react';

const DEFAULT_COLOR = '#3B82F6';

interface EditTagDialogProps {
  tag: Tag | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (tag: Tag) => void;
}

export function EditTagDialog({ tag, open, onOpenChange, onSuccess }: EditTagDialogProps) {
  const { updateTag, isUpdating } = useUpdateTag();

  const form = useForm<UpdateTagFormValues>({
    resolver: zodResolver(updateTagSchema),
    mode: 'onTouched',
    defaultValues: {
      name: tag?.name || '',
      color: tag?.color || DEFAULT_COLOR,
    },
  });

  // Reset form when tag changes
  useEffect(() => {
    if (tag) {
      form.reset({
        name: tag.name,
        color: tag.color,
      });
    }
  }, [tag, form]);

  const onSubmit = async (data: UpdateTagFormValues) => {
    if (!tag) return;

    try {
      const updatedTag = await updateTag(tag.id, data);
      onOpenChange(false);
      onSuccess?.(updatedTag);
    } catch {
      // Error handled by hook
    }
  };

  if (!tag) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
          <DialogDescription>
            Update the tag name or color.
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
                      value={field.value || tag?.color || DEFAULT_COLOR}
                      onChange={field.onChange}
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

