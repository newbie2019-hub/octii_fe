import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Tag } from '../types/tag';

interface TagItemProps {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}

export function TagItem({ tag, onEdit, onDelete }: TagItemProps) {
  return (
    <div className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className="size-4 rounded-full shrink-0"
          style={{ backgroundColor: tag.color }}
        />
        <div className="flex flex-col">
          <span className="font-medium">{tag.name}</span>
          <span className="text-sm text-muted-foreground">
            {tag.decks_count !== undefined && (
              <span>{tag.decks_count} {tag.decks_count === 1 ? 'deck' : 'decks'}</span>
            )}
            {tag.decks_count !== undefined && tag.cards_count !== undefined && ' · '}
            {tag.cards_count !== undefined && (
              <span>{tag.cards_count} {tag.cards_count === 1 ? 'card' : 'cards'}</span>
            )}
          </span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Tag actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(tag)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(tag)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

