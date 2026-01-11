import { useState } from 'react';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import octiiSad from '@/assets/images/octii_sad.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useCards } from '../hooks/useCards';
import { useToggleCardSuspension } from '../hooks/useToggleCardSuspension';
import { useBulkDeleteCards } from '../hooks/useBulkDeleteCards';
import { CardItem } from './CardItem';
import { CreateCardDialog } from './CreateCardDialog';
import { EditCardDialog } from './EditCardDialog';
import { DeleteCardDialog } from './DeleteCardDialog';
import type { Card } from '../types/card';

interface CardListProps {
  deckId: number;
}

export function CardList({ deckId }: CardListProps) {
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [deleteCard, setDeleteCard] = useState<Card | null>(null);

  const { data, isLoading, error, refetch } = useCards(deckId, { per_page: perPage, page });
  const { mutate: toggleSuspension } = useToggleCardSuspension(deckId);
  const { mutate: bulkDelete, isPending: isBulkDeleting } = useBulkDeleteCards(deckId);

  const handleToggleSuspend = (card: Card) => {
    toggleSuspension(card.id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleSelectCard = (cardId: number) => {
    setSelectedCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCards.length === data?.data.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(data?.data.map((card) => card.id) || []);
    }
  };

  const handleBulkDelete = () => {
    if (selectedCards.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedCards.length} card(s)?`)) {
      bulkDelete(
        { card_ids: selectedCards },
        {
          onSuccess: () => {
            setSelectedCards([]);
            refetch();
          },
        }
      );
    }
  };

  const filteredCards = data?.data.filter((card) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      card.front.toLowerCase().includes(query) ||
      card.back.toLowerCase().includes(query) ||
      card.card_type?.toLowerCase().includes(query)
    );
  });

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load cards</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          {selectedCards.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedCards.length})
            </Button>
          )}
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </div>
        <Input
          placeholder="Search cards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Selection Actions */}
      {data && data.data.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedCards.length === data.data.length}
            onCheckedChange={handleSelectAll}
            id="select-all"
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Select All
          </label>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && filteredCards && filteredCards.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card) => (
            <div key={card.id} className="relative">
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedCards.includes(card.id)}
                  onCheckedChange={() => handleSelectCard(card.id)}
                />
              </div>
              <CardItem
                card={card}
                onEdit={setEditCard}
                onDelete={setDeleteCard}
                onToggleSuspend={handleToggleSuspend}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!filteredCards || filteredCards.length === 0) && (
        <div className="text-center py-12">
          <img
            src={octiiSad}
            alt="No cards"
            className="mx-auto h-32 w-32 mb-6 opacity-80"
          />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? 'No cards found' : 'No cards yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Add your first card to this deck'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Card
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {data && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.current_page} of {data.meta.last_page} ({data.meta.total} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.meta.last_page, p + 1))}
              disabled={page === data.meta.last_page}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreateCardDialog
        deckId={deckId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
      />

      {editCard && (
        <EditCardDialog
          deckId={deckId}
          card={editCard}
          open={!!editCard}
          onOpenChange={(open) => !open && setEditCard(null)}
          onSuccess={refetch}
        />
      )}

      {deleteCard && (
        <DeleteCardDialog
          deckId={deckId}
          card={deleteCard}
          open={!!deleteCard}
          onOpenChange={(open) => !open && setDeleteCard(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}

