import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import type { CreateDeckFormValues } from '../schemas/deckSchema';

export function CardListEditor() {
  const { control } = useFormContext<CreateDeckFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'cards',
  });

  const addCard = () => {
    append({
      front: '',
      back: '',
      card_type: 'basic',
      media: [],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cards</h3>
        <Button type="button" variant="outline" size="sm" onClick={addCard}>
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No cards yet. Click &quot;Add Card&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <CardEditor key={field.id} index={index} onRemove={() => remove(index)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface CardEditorProps {
  index: number;
  onRemove: () => void;
}

function CardEditor({ index, onRemove }: CardEditorProps) {
  const { control } = useFormContext<CreateDeckFormValues>();
  const [showMedia, setShowMedia] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Card {index + 1}</CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name={`cards.${index}.front`}
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Front</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Question or term..."
                  className="resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`cards.${index}.back`}
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Back</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Answer or definition..."
                  className="resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`cards.${index}.card_type`}
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Card Type (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., basic, cloze" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowMedia(!showMedia)}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            {showMedia ? 'Hide Media' : 'Add Media'}
          </Button>
        </div>

        {showMedia && <CardMediaEditor cardIndex={index} />}
      </CardContent>
    </Card>
  );
}

interface CardMediaEditorProps {
  cardIndex: number;
}

function CardMediaEditor({ cardIndex }: CardMediaEditorProps) {
  const { control } = useFormContext<CreateDeckFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `cards.${cardIndex}.media`,
  });

  const addMedia = () => {
    append({
      media_type: 'image',
      position: fields.length,
    });
  };

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Media Files</h4>
        <Button type="button" variant="outline" size="sm" onClick={addMedia}>
          <Plus className="mr-2 h-3 w-3" />
          Add Media
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">No media files attached.</p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, mediaIndex) => (
            <MediaFileInput
              key={field.id}
              cardIndex={cardIndex}
              mediaIndex={mediaIndex}
              onRemove={() => remove(mediaIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MediaFileInputProps {
  cardIndex: number;
  mediaIndex: number;
  onRemove: () => void;
}

function MediaFileInput({ cardIndex, mediaIndex, onRemove }: MediaFileInputProps) {
  const { control, setValue } = useFormContext<CreateDeckFormValues>();
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(`cards.${cardIndex}.media.${mediaIndex}.file`, file);
      setFileName(file.name);
    }
  };

  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 space-y-2">
        <FormField
          control={control}
          name={`cards.${cardIndex}.media.${mediaIndex}.media_type`}
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="text-xs">Type</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="image">Image</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`cards.${cardIndex}.media.${mediaIndex}.file`}
          render={() => (
            <FormItem>
              <FormLabel className="text-xs">File</FormLabel>
              <FormControl>
                <Input type="file" onChange={handleFileChange} accept="image/*,audio/*,video/*" />
              </FormControl>
              {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="mt-6">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

