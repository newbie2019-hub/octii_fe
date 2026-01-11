# Card Feature

This feature handles all card-related functionality for the Octii flashcard application.

## Overview

The Card feature provides comprehensive card management capabilities including:

- **Card CRUD Operations**: Create, read, update, and delete individual cards
- **Bulk Operations**: Delete multiple cards at once
- **Media Support**: Attach images, audio, and video files to cards
- **Card Suspension**: Temporarily exclude cards from review sessions
- **Tagging**: Organize cards with tags
- **Pagination**: Efficiently browse large card collections

## Structure

```
card/
├── components/          # UI components
│   ├── CardItem.tsx            # Individual card display
│   ├── CardList.tsx            # Card list with pagination and search
│   ├── CreateCardDialog.tsx    # Dialog for creating new cards
│   ├── EditCardDialog.tsx      # Dialog for editing cards
│   └── DeleteCardDialog.tsx    # Confirmation dialog for deletion
├── hooks/              # Custom React hooks
│   ├── useCards.ts             # Fetch paginated cards list
│   ├── useCard.ts              # Fetch single card
│   ├── useCreateCard.ts        # Create card mutation
│   ├── useUpdateCard.ts        # Update card mutation
│   ├── useDeleteCard.ts        # Delete card mutation
│   ├── useToggleCardSuspension.ts  # Toggle suspension mutation
│   └── useBulkDeleteCards.ts   # Bulk delete mutation
├── services/           # API service layer
│   └── cardService.ts          # Card API calls
├── schemas/            # Validation schemas
│   └── cardSchema.ts           # Zod schemas for forms
├── types/              # TypeScript types
│   └── card.ts                 # Card-related type definitions
├── index.ts            # Public API exports
└── README.md           # This file
```

## Usage

### Importing

```typescript
import {
  // Components
  CardList,
  CardItem,
  CreateCardDialog,
  EditCardDialog,
  DeleteCardDialog,

  // Hooks
  useCards,
  useCard,
  useCreateCard,
  useUpdateCard,
  useDeleteCard,
  useToggleCardSuspension,
  useBulkDeleteCards,

  // Service
  cardService,

  // Types
  Card,
  CreateCardInput,
  UpdateCardInput,

  // Schemas
  createCardSchema,
  updateCardSchema,
} from '@/features/card';
```

### Example: Display Cards List

```typescript
import { CardList } from '@/features/card';

function MyDeckPage() {
  const deckId = 1; // Get from route params

  return (
    <div>
      <h1>Cards</h1>
      <CardList deckId={deckId} />
    </div>
  );
}
```

### Example: Create a Card

```typescript
import { useCreateCard } from '@/features/card';

function MyComponent() {
  const deckId = 1;
  const { mutate: createCard, isPending } = useCreateCard(deckId);

  const handleCreate = () => {
    createCard({
      front: 'What is React?',
      back: 'A JavaScript library for building user interfaces',
      card_type: 'basic',
    });
  };

  return (
    <button onClick={handleCreate} disabled={isPending}>
      Create Card
    </button>
  );
}
```

### Example: Create Card with Media

```typescript
import { useCreateCard } from '@/features/card';

function CreateCardWithMedia() {
  const deckId = 1;
  const { mutate: createCard } = useCreateCard(deckId);

  const handleFileUpload = (file: File) => {
    createCard({
      front: 'Listen to this audio',
      back: 'This is the answer',
      media: [{
        media_type: 'audio',
        file: file,
        position: 0,
      }],
    });
  };

  return (
    <input
      type="file"
      accept="audio/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
      }}
    />
  );
}
```

### Example: Bulk Delete Cards

```typescript
import { useBulkDeleteCards } from '@/features/card';

function BulkDeleteExample() {
  const deckId = 1;
  const { mutate: bulkDelete } = useBulkDeleteCards(deckId);

  const handleBulkDelete = () => {
    bulkDelete({
      card_ids: [1, 2, 3, 4, 5],
    });
  };

  return (
    <button onClick={handleBulkDelete}>
      Delete Selected Cards
    </button>
  );
}
```

## API Endpoints

All endpoints are implemented in `cardService.ts`:

- `GET /api/decks/{deck}/cards` - List cards (paginated)
- `GET /api/decks/{deck}/cards/{card}` - Get single card
- `POST /api/decks/{deck}/cards` - Create card
- `PUT /api/decks/{deck}/cards/{card}` - Update card
- `DELETE /api/decks/{deck}/cards/{card}` - Delete card
- `POST /api/decks/{deck}/cards/{card}/toggle-suspend` - Toggle suspension
- `POST /api/decks/{deck}/cards/bulk-delete` - Bulk delete cards

## Form Validation

All forms use Zod schemas for validation:

### Create Card Schema

```typescript
{
  front: string (required, max 10000 chars)
  back: string (required, max 10000 chars)
  external_id?: string (max 255 chars)
  card_type?: string (max 50 chars)
  media?: CardMediaInput[] (max 10 files)
  tag_ids?: number[]
}
```

### Media Schema

```typescript
{
  media_type: 'image' | 'audio' | 'video' (required)
  file?: File
  base64?: string
  file_name?: string (required with base64)
  mime_type?: string (required with base64)
  position?: number (min 0)
}
```

## Features

### Card Management
- Create cards with rich text content
- Edit existing cards
- Delete individual cards
- Bulk delete multiple cards

### Media Support
- Upload images, audio, and video files
- Support for both File uploads and base64 encoding
- Maximum 10 media files per card
- Maximum 10MB per file

### Card Organization
- Tag cards for organization
- Filter and search cards
- Paginated card lists

### Card Suspension
- Temporarily exclude cards from reviews
- Toggle suspension on/off
- Suspended cards remain in the deck

## Best Practices

1. **Always validate deck access**: The API checks if the user owns the deck
2. **Handle loading states**: All mutations return `isPending` status
3. **Use optimistic updates**: The hooks automatically invalidate queries
4. **Limit media size**: Keep files under 10MB for better performance
5. **Use appropriate media types**: Match file extensions to media types
6. **Implement search**: Use client-side filtering for better UX
7. **Handle errors gracefully**: All hooks show toast notifications

## Related Features

- **Deck Feature**: Parent deck management
- **Import Feature**: Bulk card imports
- **Review Feature**: Study sessions (coming soon)
- **Tags Feature**: Card tagging system (coming soon)

## Type Safety

This feature is fully typed with TypeScript. All API responses, form inputs, and component props have proper type definitions.

## Error Handling

All API errors are handled automatically by the hooks and display user-friendly toast notifications. Network errors, validation errors, and authorization errors are all properly handled.

## State Management

Card data is managed using TanStack Query (React Query):
- Automatic caching
- Background refetching
- Optimistic updates
- Query invalidation

Query keys follow this pattern:
- `['cards', deckId, params]` - Cards list
- `['card', deckId, cardId]` - Single card

