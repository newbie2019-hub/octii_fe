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
import { createCardSchema, type CreateCardFormValues, CARD_TYPES } from '../schemas/cardSchema';
import { useCreateCard } from '../hooks/useCreateCard';
import type { PendingMediaFile, MediaType, MediaSide } from '../types/card';

interface CreateCardDialogProps {
  deckId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CARD_TYPE_OPTIONS = [
  { value: 'basic', label: 'Basic', description: 'Simple front and back card' },
  { value: 'cloze', label: 'Cloze Deletion', description: 'Fill in the blank style' },
  { value: 'image', label: 'Image', description: 'Card with image content' },
  { value: 'audio', label: 'Audio', description: 'Card with audio content' },
  { value: 'multimedia', label: 'Multimedia', description: 'Multiple media types' },
  { value: 'image_occlusion', label: 'Image Occlusion', description: 'Hide parts of an image' },
] as const;

function getMediaTypeFromFile(file: File): MediaType {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('video/')) return 'video';
  return 'image'; // Default fallback
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

export function CreateCardDialog({ deckId, open, onOpenChange, onSuccess }: CreateCardDialogProps) {
  const { mutateWithMedia, isPending } = useCreateCard(deckId);
  const [pendingMediaFiles, setPendingMediaFiles] = useState<PendingMediaFile[]>([]);
  const [selectedSide, setSelectedSide] = useState<MediaSide>('front');

  const form = useForm<CreateCardFormValues>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      front: '',
      back: '',
      external_id: '',
      card_type: 'basic',
      tag_ids: [],
    },
    mode: 'onTouched',
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        front: '',
        back: '',
        external_id: '',
        card_type: 'basic',
        tag_ids: [],
      });
      cleanupPendingMedia();
    }
  }, [open]);

  const cleanupPendingMedia = useCallback(() => {
    pendingMediaFiles.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setPendingMediaFiles([]);
  }, [pendingMediaFiles]);

  const handleSubmit = async (values: CreateCardFormValues) => {
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

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (pendingMediaFiles.length + files.length > 10) {
      form.setError('media', {
        message: 'Maximum 10 media files per card',
      });
      return;
    }

    const newPendingFiles: PendingMediaFile[] = files.map((file, index) => ({
      file,
      media_type: getMediaTypeFromFile(file),
      side: selectedSide,
      position: pendingMediaFiles.length + index,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setPendingMediaFiles((prev) => [...prev, ...newPendingFiles]);
    // Reset the input
    e.target.value = '';
  }, [pendingMediaFiles.length, selectedSide, form]);

  const removeMediaFile = useCallback((index: number) => {
    setPendingMediaFiles((prev) => {
      const file = prev[index];
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, position: i }));
    });
  }, []);

  const handleClose = useCallback(() => {
    cleanupPendingMedia();
    form.reset();
    onOpenChange(false);
  }, [cleanupPendingMedia, form, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Card</DialogTitle>
          <DialogDescription>
            Add a new flashcard to this deck. Use the editor toolbar for formatting and LaTeX formulas.
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select card type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CARD_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex flex-col items-start">
                            <span>{type.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {type.description}
                            </span>
                          </div>
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
                      value={field.value}
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
                      value={field.value}
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

            {/* Media Upload Section - Always shown for all card types */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <FormLabel>Media Files (Optional)</FormLabel>
              <p className="text-xs text-muted-foreground -mt-1">
                Add images, audio, or video to either side of your flashcard.
              </p>
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
                    disabled={pendingMediaFiles.length >= 10}
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
                        className="flex items-center justify-between p-3 bg-background rounded-lg border"
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
                              {mediaFile.side} side • {mediaFile.media_type}
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
                {pendingMediaFiles.length}/10 files • Supports images, audio, and video (max 10MB each)
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
                Create Card
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
