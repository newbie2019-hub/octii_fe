import { useState, useEffect, useCallback } from 'react';
import { Check, ChevronsUpDown, Plus, X, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { useTags } from '../hooks/useTags';
import { useCreateTag } from '../hooks/useCreateTag';
import { useDeleteTag } from '../hooks/useDeleteTag';
import type { Tag } from '../types/tag';

// Predefined color palette for new tags
const TAG_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

interface TagSelectorProps {
  /**
   * Currently selected tag IDs
   */
  selectedTagIds: number[];
  /**
   * Callback when tag selection changes
   */
  onChange: (tagIds: number[]) => void;
  /**
   * Placeholder text for the trigger button
   */
  placeholder?: string;
  /**
   * Whether the selector is disabled
   */
  disabled?: boolean;
  /**
   * Whether to allow creating new tags
   */
  allowCreate?: boolean;
  /**
   * Whether to allow deleting tags
   */
  allowDelete?: boolean;
  /**
   * Custom class name for the trigger button
   */
  className?: string;
}

export function TagSelector({
  selectedTagIds,
  onChange,
  placeholder = 'Select tags...',
  disabled = false,
  allowCreate = true,
  allowDelete = true,
  className,
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const { data: tags, isLoading, fetchTags, addTagToList, removeTagFromList } = useTags();
  const { createTag, isCreating } = useCreateTag();
  const { deleteTag, isDeleting } = useDeleteTag();

  // Fetch tags when popover opens
  useEffect(() => {
    if (open && tags.length === 0) {
      fetchTags();
    }
  }, [open, tags.length, fetchTags]);

  // Get selected tag objects
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));

  // Filter tags by search
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Check if search value matches an existing tag
  const exactMatch = tags.some(
    (tag) => tag.name.toLowerCase() === searchValue.toLowerCase()
  );

  const handleSelect = useCallback(
    (tagId: number) => {
      if (selectedTagIds.includes(tagId)) {
        onChange(selectedTagIds.filter((id) => id !== tagId));
      } else {
        onChange([...selectedTagIds, tagId]);
      }
    },
    [selectedTagIds, onChange]
  );

  const handleRemoveTag = useCallback(
    (tagId: number, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(selectedTagIds.filter((id) => id !== tagId));
    },
    [selectedTagIds, onChange]
  );

  const handleCreateTag = useCallback(async () => {
    if (!searchValue.trim() || exactMatch) return;

    try {
      // Pick a random color from the palette
      const randomColor = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
      const newTag = await createTag({
        name: searchValue.trim(),
        color: randomColor,
      });
      addTagToList(newTag);
      onChange([...selectedTagIds, newTag.id]);
      setSearchValue('');
    } catch {
      // Error handled by hook
    }
  }, [searchValue, exactMatch, createTag, addTagToList, selectedTagIds, onChange]);

  const handleDeleteClick = useCallback((tag: Tag, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!tagToDelete) return;

    try {
      await deleteTag(tagToDelete.id);
      removeTagFromList(tagToDelete.id);
      // Remove from selection if it was selected
      if (selectedTagIds.includes(tagToDelete.id)) {
        onChange(selectedTagIds.filter((id) => id !== tagToDelete.id));
      }
    } catch {
      // Error handled by hook
    } finally {
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    }
  }, [tagToDelete, deleteTag, removeTagFromList, selectedTagIds, onChange]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between font-normal',
              !selectedTags.length && 'text-muted-foreground',
              className
            )}
            disabled={disabled}
          >
            <span className="flex flex-wrap gap-1 truncate">
              {selectedTags.length > 0 ? (
                selectedTags.length <= 2 ? (
                  selectedTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="mr-1 gap-1"
                      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                    >
                      {tag.name}
                      <X
                        className="h-3 w-3 cursor-pointer hover:opacity-70"
                        onClick={(e) => handleRemoveTag(tag.id, e)}
                      />
                    </Badge>
                  ))
                ) : (
                  <span className="text-foreground">
                    {selectedTags.length} tags selected
                  </span>
                )
              ) : (
                placeholder
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search or create tags..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading tags...
                  </span>
                </div>
              ) : (
                <>
                  <CommandEmpty>
                    {searchValue.trim() && allowCreate ? (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer"
                        onClick={handleCreateTag}
                        disabled={isCreating}
                      >
                        {isCreating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        Create "{searchValue.trim()}"
                      </button>
                    ) : (
                      'No tags found.'
                    )}
                  </CommandEmpty>
                  <CommandGroup heading="Tags">
                    {filteredTags.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        value={tag.id.toString()}
                        onSelect={() => handleSelect(tag.id)}
                        className="group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Check
                            className={cn(
                              'h-4 w-4',
                              selectedTagIds.includes(tag.id)
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span>{tag.name}</span>
                          {tag.decks_count !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              ({tag.decks_count} decks)
                            </span>
                          )}
                        </div>
                        {allowDelete && (
                          <button
                            type="button"
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                            onClick={(e) => handleDeleteClick(tag, e)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {allowCreate && searchValue.trim() && !exactMatch && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          onSelect={handleCreateTag}
                          disabled={isCreating}
                          className="cursor-pointer"
                        >
                          {isCreating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          Create "{searchValue.trim()}"
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tag "{tagToDelete?.name}"? This tag
              will be removed from all associated decks and cards. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

