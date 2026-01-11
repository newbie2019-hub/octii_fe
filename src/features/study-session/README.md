# Study Session Feature

> A user-friendly approach to studying flashcards that prevents overwhelm and maximizes retention.

## Overview

The study session feature implements a two-phase approach:

1. **Pre-Study Configuration**: Users customize session preferences before starting
2. **Focused Study Session**: Controlled, bite-sized review experience with real-time feedback

## Architecture

### Feature Structure

```
study-session/
├── components/
│   ├── PreStudyConfig.tsx          # Configuration screen
│   ├── StudySessionCard.tsx        # Active study interface
│   └── SessionSummaryScreen.tsx    # Post-session statistics
├── hooks/
│   ├── useStudySession.ts          # Main session state machine
│   └── useDueCount.ts              # Query for due card counts
├── services/
│   └── studySessionService.ts      # API calls
├── schemas/
│   └── studySessionSchema.ts       # Zod validation
├── types/
│   └── study-session.ts            # TypeScript interfaces
└── index.ts                         # Public API
```

## User Flow

1. **Configuration Phase**
   - User selects card limit (10, 20, 50, or custom)
   - Optionally filters by tags
   - Sees estimated session time
   - Toggles interval previews

2. **Study Phase**
   - Card front is shown
   - User taps to reveal answer
   - Rates card from 1-4 (Again, Hard, Good, Easy)
   - Next card loads immediately
   - Progress bar shows completion

3. **Summary Phase**
   - Session statistics displayed
   - Rating breakdown visualization
   - Option to continue or return to dashboard

## Key Features

### Rating System

| Rating | Label | Meaning | Color |
|--------|-------|---------|-------|
| 1 | Again | "Didn't know" | 🔴 Red |
| 2 | Hard | "Struggled" | 🟠 Orange |
| 3 | Good | "Knew it" | 🟢 Green |
| 4 | Easy | "Too easy" | 🔵 Blue |

### Keyboard Shortcuts

- `1`, `2`, `3`, `4`: Rate current card (when answer is revealed)
- Works alongside touch/click interface

### Progress Tracking

- Visual progress bar
- Card counter (X / Y format)
- Session duration tracking
- Rating breakdown statistics

## API Integration

The feature uses the following endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/decks/{id}/due` | GET | Get due card count |
| `/tags` | GET | Get available tags |
| `/decks/{id}/review/next` | GET | Get next card |
| `/cards/{id}/intervals` | GET | Get interval previews (optional) |
| `/cards/{id}/review` | POST | Submit rating |

## State Management

The study session uses a local state machine with the following states:

- `idle`: No active session
- `configuring`: User setting preferences
- `loading`: Fetching next card
- `studying`: Active card review
- `paused`: Session paused (not currently used)
- `complete`: Session finished
- `abandoned`: User exited early

## Usage Example

```typescript
import { useStudySession } from "@/features/study-session";

function MyComponent() {
  const {
    state,
    startSession,
    flipCard,
    rateCard,
    exitSession,
    getSessionSummary,
  } = useStudySession();

  // Start a session
  const handleStart = () => {
    startSession({
      deckId: 1,
      deckName: "Japanese",
      maxCards: 20,
      selectedTags: [],
      showIntervals: true,
    });
  };

  // ... use other methods as needed
}
```

## Design Principles

1. **Minimal & Clean**: Simple, focused UI without distractions
2. **Progressive Disclosure**: Show options only when needed
3. **Clear Feedback**: Immediate visual response to all actions
4. **Prevent Overwhelm**: Default to manageable batch sizes
5. **Mobile-First**: Touch-friendly with keyboard enhancements

## Future Enhancements

- Offline support (queue reviews, sync later)
- Streak tracking integration
- Audio support for cards
- Swipe gestures for mobile
- Session history and analytics
- Customizable card templates



