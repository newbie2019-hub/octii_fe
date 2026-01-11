import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X, Image as ImageIcon, Music, Video } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/common/components/RichTextEditor';
import { updateCardSchema, type UpdateCardFormValues, CARD_TYPES } from '../schemas/cardSchema';
import { useUpdateCard } from '../hooks/useUpdateCard';
import type { Card, PendingMediaFile, MediaType, MediaSide } from '../types/card';

interface EditCardDialogProps {
  deckId: number;
  card: Card;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CARD_TYPE_OPTIONS = CARD_TYPES.map((type) => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
}));

function getMediaTypeFromFile(file: File): MediaType {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('video/')) return 'video';
  return 'image';
}

function getMediaIcon(type: MediaType) {
  switch (type) {
    case 'image':
      return ImageIcon;
    case 'audio':
      return Music;
    case 'video':
      return Video;
    default:
      return ImageIcon;
  }
}

export function EditCardDialog({ deckId, card, open, onOpenChange, onSuccess }: EditCardDialogProps) {
  const { mutateWithMedia, isPending } = useUpdateCard(deckId, card.id);
  const [pendingMediaFiles, setPendingMediaFiles] = useState<PendingMediaFile[]>([]);
  const [selectedSide, setSelectedSide] = useState<MediaSide>('front');

  const form = useForm<UpdateCardFormValues>({
    resolver: zodResolver(updateCardSchema),
    defaultValues: {
      front: card.front,
      back: card.back,
      external_id: card.external_id || '',
      card_type: (card.card_type as UpdateCardFormValues['card_type']) || 'basic',
    },
    mode: 'onTouched',
  });

  const handleSubmit = async (values: UpdateCardFormValues) => {
    // Remove media from form values since we handle it separately
    const { media: _, ...cardData } = values;

    await mutateWithMedia(cardData, pendingMediaFiles, {
      onSuccess: () => {
        form.reset();
        cleanupPendingMedia();
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  const cleanupPendingMedia = useCallback(() => {
    pendingMediaFiles.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setPendingMediaFiles([]);
  }, [pendingMediaFiles]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const existingMediaCount = card.media?.length || 0;
    if (existingMediaCount + pendingMediaFiles.length + files.length > 10) {
      form.setError('media', {
        message: 'Maximum 10 media files per card',
      });
      return;
    }

    const newPendingFiles: PendingMediaFile[] = files.map((file, index) => ({
      file,
      media_type: getMediaTypeFromFile(file),
      side: selectedSide,
      position: existingMediaCount + pendingMediaFiles.length + index,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setPendingMediaFiles((prev) => [...prev, ...newPendingFiles]);
    e.target.value = '';
  }, [card.media?.length, pendingMediaFiles.length, selectedSide, form]);

  const removeMediaFile = useCallback((index: number) => {
    setPendingMediaFiles((prev) => {
      const file = prev[index];
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter((_, i) => i !== index).map((f, i) => ({
        ...f,
        position: (card.media?.length || 0) + i,
      }));
    });
  }, [card.media?.length]);

  const handleClose = useCallback(() => {
    cleanupPendingMedia();
    form.reset();
    onOpenChange(false);
  }, [cleanupPendingMedia, form, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update the flashcard content. Use the editor toolbar for formatting and LaTeX formulas.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="card_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select card type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CARD_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="front"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Front Side</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Enter the question or prompt..."
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="back"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Back Side</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Enter the answer..."
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="external_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="External identifier for imports" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Existing Media */}
            {card.media && card.media.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Current Media</FormLabel>
                <div className="space-y-2">
                  {card.media.map((media) => {
                    const Icon = getMediaIcon(media.media_type);
                    return (
                      <div
                        key={media.id}
                        className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border"
                      >
                        {media.media_type === 'image' ? (
                          <img
                            src={media.url}
                            alt={media.file_name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{media.file_name}</p>
                          <p className="text-xs text-muted-foreground">{media.media_type}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add New Media */}
            <div className="space-y-3">
              <FormLabel>Add New Media Files</FormLabel>
              <div className="flex items-center gap-3">
                <Select
                  value={selectedSide}
                  onValueChange={(value: MediaSide) => setSelectedSide(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Front</SelectItem>
                    <SelectItem value="back">Back</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*,audio/*,video/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={(card.media?.length || 0) + pendingMediaFiles.length >= 10}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {pendingMediaFiles.length > 0 && (
                <div className="space-y-2 mt-3">
                  {pendingMediaFiles.map((mediaFile, index) => {
                    const Icon = getMediaIcon(mediaFile.media_type);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {mediaFile.previewUrl ? (
                            <img
                              src={mediaFile.previewUrl}
                              alt="Preview"
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{mediaFile.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {mediaFile.side} side • {mediaFile.media_type} • New
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMediaFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {(card.media?.length || 0) + pendingMediaFiles.length}/10 files • Max 10MB each
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Card
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
