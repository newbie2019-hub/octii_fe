import { useState, useCallback } from 'react';
import { FloatingRichTextEditor } from '@/common/components/FloatingRichTextEditor';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Type,
  Upload,
  X,
  Image as ImageIcon,
  Music,
  Video,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadService } from '@/common/services/uploadService';
import { toast } from 'sonner';
import type { MediaType } from '@/features/card/types/card';

interface MediaFile {
  file?: File;
  url: string;
  mediaType: MediaType;
  filename?: string; // For uploaded files
  previewUrl?: string;
}

interface BasicCardEditorProps {
  frontValue: string;
  backValue: string;
  onFrontChange: (value: string) => void;
  onBackChange: (value: string) => void;
  frontMedia: MediaFile | null;
  backMedia: MediaFile | null;
  onFrontMediaChange: (media: MediaFile | null) => void;
  onBackMediaChange: (media: MediaFile | null) => void;
  disabled?: boolean;
}

type ContentMode = 'text' | 'media';

/**
 * BasicCardEditor - Create a basic flashcard with front/back
 * Each side can either have text (WYSIWYG) or a media file (image/audio)
 */
export function BasicCardEditor({
  frontValue,
  backValue,
  onFrontChange,
  onBackChange,
  frontMedia,
  backMedia,
  onFrontMediaChange,
  onBackMediaChange,
  disabled = false,
}: BasicCardEditorProps) {
  const [frontMode, setFrontMode] = useState<ContentMode>(frontMedia ? 'media' : 'text');
  const [backMode, setBackMode] = useState<ContentMode>(backMedia ? 'media' : 'text');
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  const handleFileUpload = useCallback(async (
    file: File,
    side: 'front' | 'back'
  ) => {
    const setUploading = side === 'front' ? setUploadingFront : setUploadingBack;
    const setMedia = side === 'front' ? onFrontMediaChange : onBackMediaChange;

    setUploading(true);
    try {
      const mediaType = getMediaTypeFromFile(file);
      const previewUrl = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined;

      // Upload to temp storage
      const response = await uploadService.uploadToTemp(file, mediaType);

      setMedia({
        file,
        url: response.data.url,
        mediaType,
        filename: response.data.filename,
        previewUrl,
      });

      // Clear the text when switching to media mode
      if (side === 'front') {
        onFrontChange('');
      } else {
        onBackChange('');
      }
    } catch {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [onFrontChange, onBackChange, onFrontMediaChange, onBackMediaChange]);

  const removeMedia = useCallback(async (side: 'front' | 'back') => {
    const media = side === 'front' ? frontMedia : backMedia;
    const setMedia = side === 'front' ? onFrontMediaChange : onBackMediaChange;

    if (media?.filename) {
      try {
        await uploadService.deleteTempFile(media.filename);
      } catch {
        // Ignore cleanup errors
      }
    }
    if (media?.previewUrl) {
      URL.revokeObjectURL(media.previewUrl);
    }
    setMedia(null);
  }, [frontMedia, backMedia, onFrontMediaChange, onBackMediaChange]);

  const switchToText = (side: 'front' | 'back') => {
    if (side === 'front') {
      removeMedia('front');
      setFrontMode('text');
    } else {
      removeMedia('back');
      setBackMode('text');
    }
  };

  const switchToMedia = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontMode('media');
    } else {
      setBackMode('media');
    }
  };

  return (
    <div className="space-y-6">
      {/* Front Side */}
      <CardSide
        label="Front"
        description="Question, term, or prompt"
        mode={frontMode}
        value={frontValue}
        onChange={onFrontChange}
        media={frontMedia}
        onFileUpload={(file) => handleFileUpload(file, 'front')}
        onRemoveMedia={() => removeMedia('front')}
        onSwitchToText={() => switchToText('front')}
        onSwitchToMedia={() => switchToMedia('front')}
        isUploading={uploadingFront}
        disabled={disabled}
        placeholder="Enter your question or term..."
      />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dashed" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            flip
          </span>
        </div>
      </div>

      {/* Back Side */}
      <CardSide
        label="Back"
        description="Answer, definition, or explanation"
        mode={backMode}
        value={backValue}
        onChange={onBackChange}
        media={backMedia}
        onFileUpload={(file) => handleFileUpload(file, 'back')}
        onRemoveMedia={() => removeMedia('back')}
        onSwitchToText={() => switchToText('back')}
        onSwitchToMedia={() => switchToMedia('back')}
        isUploading={uploadingBack}
        disabled={disabled}
        placeholder="Enter the answer or definition..."
      />
    </div>
  );
}

interface CardSideProps {
  label: string;
  description: string;
  mode: ContentMode;
  value: string;
  onChange: (value: string) => void;
  media: MediaFile | null;
  onFileUpload: (file: File) => void;
  onRemoveMedia: () => void;
  onSwitchToText: () => void;
  onSwitchToMedia: () => void;
  isUploading: boolean;
  disabled: boolean;
  placeholder: string;
}

function CardSide({
  label,
  description,
  mode,
  value,
  onChange,
  media,
  onFileUpload,
  onRemoveMedia,
  onSwitchToText,
  onSwitchToMedia,
  isUploading,
  disabled,
  placeholder,
}: CardSideProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={onSwitchToText}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              mode === 'text'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Type className="h-3.5 w-3.5" />
            Text
          </button>
          <button
            type="button"
            onClick={onSwitchToMedia}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              mode === 'media'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Upload className="h-3.5 w-3.5" />
            Media
          </button>
        </div>
      </div>

      {mode === 'text' ? (
        <FloatingRichTextEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          minHeight="120px"
        />
      ) : (
        <MediaUploadZone
          media={media}
          onFileUpload={onFileUpload}
          onRemove={onRemoveMedia}
          isUploading={isUploading}
          disabled={disabled}
        />
      )}
    </div>
  );
}

interface MediaUploadZoneProps {
  media: MediaFile | null;
  onFileUpload: (file: File) => void;
  onRemove: () => void;
  isUploading: boolean;
  disabled: boolean;
}

function MediaUploadZone({
  media,
  onFileUpload,
  onRemove,
  isUploading,
  disabled,
}: MediaUploadZoneProps) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && !disabled && !isUploading) {
      onFileUpload(file);
    }
  }, [disabled, isUploading, onFileUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (media) {
    return (
      <div className="relative rounded-lg border bg-muted/30 overflow-hidden">
        {media.mediaType === 'image' && (
          <div className="relative aspect-video max-h-64">
            <img
              src={media.previewUrl || media.url}
              alt="Card media"
              className="w-full h-full object-contain"
            />
          </div>
        )}
        {media.mediaType === 'audio' && (
          <div className="p-6 flex items-center justify-center">
            <div className="flex items-center gap-3 px-4 py-3 bg-background rounded-lg border">
              <Music className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {media.file?.name || 'Audio file'}
                </p>
                <p className="text-xs text-muted-foreground">Audio</p>
              </div>
            </div>
          </div>
        )}
        {media.mediaType === 'video' && (
          <div className="relative aspect-video max-h-64">
            <video
              src={media.url}
              controls
              className="w-full h-full object-contain"
            />
          </div>
        )}
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 hover:bg-background shadow-md transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <label
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-8',
        'border-2 border-dashed rounded-lg cursor-pointer transition-all',
        'hover:border-primary/50 hover:bg-muted/30',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {isUploading ? (
        <>
          <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-muted">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="p-2 rounded-full bg-muted">
              <Music className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="p-2 rounded-full bg-muted">
              <Video className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Drop a file here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">
              Images, audio, or video (max 10MB)
            </p>
          </div>
        </>
      )}
      <input
        type="file"
        accept="image/*,audio/*,video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileUpload(file);
          e.target.value = '';
        }}
        disabled={disabled || isUploading}
        className="hidden"
      />
    </label>
  );
}

function getMediaTypeFromFile(file: File): MediaType {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('video/')) return 'video';
  return 'image';
}

export default BasicCardEditor;

