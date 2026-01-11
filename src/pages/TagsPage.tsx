import { useState } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useTags,
  CreateTagDialog,
  EditTagDialog,
  DeleteTagDialog,
  TagItem,
  type Tag,
} from '@/features/tag';
import octiiSad from '@/assets/images/octii_sad.png';

export function TagsPage() {
  // Tag data
  const {
    data: tags,
    isLoading,
    addTagToList,
    removeTagFromList,
    updateTagInList,
  } = useTags();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  // Filter tags by search query
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSuccess = (tag: Tag) => {
    addTagToList(tag);
  };

  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = (tag: Tag) => {
    updateTagInList(tag);
  };

  const handleDeleteTag = (tag: Tag) => {
    setSelectedTag(tag);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    if (selectedTag) {
      removeTagFromList(selectedTag.id);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tags</h1>
            <p className="text-muted-foreground mt-1">
              Organize your decks and cards with tags
            </p>
          </div>

          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Tag
          </Button>
        </div>

        {/* Search - only show when there are tags */}
        {(tags.length > 0 || searchQuery) && (
          <div className="flex justify-end">
            <div className="relative max-w-md w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="pl-9"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading && tags.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="text-center py-20">
          <img
            src={octiiSad}
            alt="No tags"
            className="mx-auto h-32 w-32 mb-6 opacity-80"
          />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? 'No tags found' : 'No tags yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Create your first tag to organize your content'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Tag
            </Button>
          )}
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Tag List */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTags.map((tag) => (
              <TagItem
                key={tag.id}
                tag={tag}
                onEdit={handleEditTag}
                onDelete={handleDeleteTag}
              />
            ))}
          </div>

          {/* Stats */}
          <div className="text-center text-sm text-muted-foreground mt-8">
            {searchQuery
              ? `Showing ${filteredTags.length} of ${tags.length} tags`
              : `${tags.length} ${tags.length === 1 ? 'tag' : 'tags'} total`}
          </div>
        </>
      )}

      {/* Dialogs */}
      <CreateTagDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <EditTagDialog
        tag={selectedTag}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />

      <DeleteTagDialog
        tag={selectedTag}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

export default TagsPage;
