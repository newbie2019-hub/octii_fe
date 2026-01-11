# Deck Management Feature

Complete implementation of the deck management system based on the Octii API documentation.

## Overview

This feature provides comprehensive deck and card management functionality including:
- Creating, editing, and deleting decks
- Managing cards within decks
- Supporting media attachments (images, audio, video)
- Hierarchical deck organization
- Pagination and search

## Architecture

### Types (`types/deck.ts`)
- Complete TypeScript definitions matching the API response structure
- Input types for creating/updating decks
- Media type definitions
- Pagination metadata types

### Schemas (`schemas/deckSchema.ts`)
- Zod validation schemas for form inputs
- Card and media validation
- Type inference from schemas
- Comprehensive validation rules (max file size, max cards, etc.)

### Services (`services/deckService.ts`)
- API client integration
- Handles both `multipart/form-data` (for file uploads) and JSON requests
- Automatic FormData conversion for media files
- Complete CRUD operations for decks

### Hooks

#### `useDecks`
- Fetches paginated list of decks
- Loading and error states
- Refresh functionality

#### `useDeck`
- Fetches single deck with full details
- Includes cards and media

#### `useCreateDeck`
- Creates new deck with optional cards
- Handles file uploads
- Toast notifications

#### `useUpdateDeck`
- Updates existing deck
- Supports partial updates
- File upload support

#### `useDeleteDeck`
- Deletes deck and all associated data
- Confirmation flow

### State Management (`store/deckStore.ts`)
- Zustand store for global deck state
- Selected deck tracking
- CRUD operations on local state
- Synchronized with server state

### Components

#### `DeckCard`
- Card-based deck display
- Shows deck name, description, card count, subdeck count
- Action menu (view, edit, delete)
- Timestamp display

#### `CreateDeckDialog`
- Simple form for creating empty deck
- Name and description fields
- Validation with React Hook Form + Zod

#### `CreateDeckWithCardsDialog`
- Advanced form for creating deck with cards
- Embedded card editor
- Media upload support
- Scrollable dialog for large forms

#### `EditDeckDialog`
- Edit deck metadata (name, description)
- Pre-populated with current values
- Auto-updates on deck change

#### `DeleteDeckDialog`
- Confirmation dialog
- Shows impact (number of cards to be deleted)
- Prevents accidental deletion

#### `DeckDetailsDialog`
- Full deck information display
- Card list preview
- Media file indicators
- Creation/update timestamps

#### `CardListEditor`
- Dynamic card form array
- Add/remove cards
- Front/back text fields
- Card type selector
- Media attachment interface

### Pages

#### `DecksPage`
- Main deck management interface
- Grid layout for deck cards
- Search functionality
- Create deck dropdown (empty or with cards)
- Pagination with "Load More"
- Empty states and loading states
- Integrated with all dialogs

## API Integration

The implementation follows the API documentation exactly:

### Endpoints Used
- `GET /api/decks` - List decks (with pagination)
- `GET /api/decks/{id}` - Get single deck
- `POST /api/decks` - Create deck
- `PUT /api/decks/{id}` - Update deck
- `DELETE /api/decks/{id}` - Delete deck

### Features Supported
✅ Pagination with configurable page size
✅ Hierarchical deck organization (parent_id)
✅ Bulk card creation (up to 1000 cards)
✅ Media file uploads (image, audio, video)
✅ Both FormData and JSON request formats
✅ Base64 media encoding support
✅ Auto-cleanup of media files
✅ Transaction-based operations

## Usage Examples

### Creating a Simple Deck
```typescript
const { createDeck } = useCreateDeck();

await createDeck({
  name: 'Spanish Vocabulary',
  description: 'Common Spanish words',
});
```

### Creating a Deck with Cards and Media
```typescript
await createDeck({
  name: 'Geography',
  description: 'World capitals',
  cards: [
    {
      front: 'What is the capital of France?',
      back: 'Paris',
      media: [
        {
          media_type: 'image',
          file: imageFile,
          position: 0,
        },
      ],
    },
  ],
});
```

### Fetching and Filtering Decks
```typescript
const { fetchDecks, decks } = useDecks();

// Initial fetch
useEffect(() => {
  fetchDecks({ per_page: 20 });
}, []);

// Client-side search
const filtered = decks.filter(deck =>
  deck.name.toLowerCase().includes(query.toLowerCase())
);
```

## File Structure
```
src/features/deck/
├── components/
│   ├── CardListEditor.tsx          # Dynamic card form array
│   ├── CreateDeckDialog.tsx        # Simple deck creation
│   ├── CreateDeckWithCardsDialog.tsx # Advanced deck creation
│   ├── DeckCard.tsx                # Deck display card
│   ├── DeleteDeckDialog.tsx        # Delete confirmation
│   ├── DeckDetailsDialog.tsx       # Deck details view
│   └── EditDeckDialog.tsx          # Edit deck metadata
├── hooks/
│   ├── useCreateDeck.ts
│   ├── useDeck.ts
│   ├── useDecks.ts
│   ├── useDeleteDeck.ts
│   └── useUpdateDeck.ts
├── schemas/
│   └── deckSchema.ts               # Zod validation schemas
├── services/
│   └── deckService.ts              # API client methods
├── types/
│   └── deck.ts                     # TypeScript definitions
├── index.ts                        # Public API
└── README.md                       # This file

src/store/
└── deckStore.ts                    # Global state management

src/pages/
└── DecksPage.tsx                   # Main page component
```

## Dependencies Added
- `date-fns` - Date formatting and relative time
- `@radix-ui/react-scroll-area` - Scrollable areas in dialogs

## Best Practices Implemented

### Form Handling
- ✅ Schema-first validation with Zod
- ✅ Type inference from schemas
- ✅ `mode: "onTouched"` for better UX
- ✅ Clean submit handlers (logic in hooks/services)

### Component Architecture
- ✅ Atomic design with Shadcn/UI base
- ✅ Clear separation: components, hooks, services
- ✅ PascalCase components, camelCase hooks
- ✅ Composition over prop drilling

### TypeScript
- ✅ No `any` types
- ✅ Strict type checking
- ✅ Interface-based API contracts
- ✅ Type inference where possible

### UI/UX
- ✅ Loading states on all actions
- ✅ Toast notifications for feedback
- ✅ Confirmation dialogs for destructive actions
- ✅ Accessibility (labels, form messages, ARIA)
- ✅ Empty states
- ✅ Mobile-first Tailwind classes

### Module Boundaries
- ✅ Feature-level public API via index.ts
- ✅ Clean imports using @/ alias
- ✅ Encapsulated implementation details

## Future Enhancements

Potential improvements for future iterations:
- [ ] Optimistic UI updates
- [ ] Infinite scroll instead of "Load More"
- [ ] Drag-and-drop card reordering
- [ ] Bulk operations (multi-select, bulk delete)
- [ ] Card templates
- [ ] Advanced search and filters
- [ ] Deck duplication
- [ ] Export functionality
- [ ] Collaborative editing
- [ ] Deck sharing

## Testing Considerations

For comprehensive testing, consider:
- Unit tests for validation schemas
- Integration tests for API service methods
- Component tests for forms and dialogs
- E2E tests for complete flows
- Error boundary testing
- File upload edge cases
- Pagination edge cases

