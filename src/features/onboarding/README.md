# Onboarding Feature

## Overview

The onboarding feature provides a multi-step flow for new users to complete when they first sign up. It collects user information such as their focus area and referral source to help personalize the experience and gather marketing insights.

## Flow

1. **Welcome Screen**: Shows a welcome message with the user's name and the Octii welcome image, followed by a loading indicator for 2 seconds
2. **Focus Area Selection**: User selects what they're focusing on (e.g., Medical, Engineering, Computer Science)
3. **Referral Source**: User selects how they heard about the app

## Components

### OnboardingPage

Located at `src/pages/OnboardingPage.tsx`

The main onboarding page component that manages the multi-step flow. It includes:
- Welcome screen with animated loader
- Focus area selection grid
- Referral source selection grid
- Progress indicators

**Features:**
- Minimal and clean design
- Centered layout with `flex justify-center items-center`
- Smooth transitions between steps
- Loading states during API calls
- Automatic navigation to dashboard upon completion

## Hooks

### useOnboarding

Located at `src/features/onboarding/hooks/useOnboarding.ts`

Custom hook for updating user onboarding information.

**Usage:**
```typescript
const { mutate, isPending, error } = useOnboarding();

mutate(
  { focus_area: 'Computer Science' },
  {
    onSuccess: (response) => {
      console.log('Onboarding updated:', response);
    },
    onError: (error) => {
      console.error('Failed to update:', error);
    }
  }
);
```

## Services

### onboardingService

Located at `src/features/onboarding/services/onboardingService.ts`

Service for making API calls to the onboarding endpoint.

**Methods:**
- `updateOnboarding(data: OnboardingData)`: Updates user onboarding information

## Types

Located at `src/features/onboarding/types/onboarding.ts`

**OnboardingData:**
```typescript
interface OnboardingData {
  status?: string;
  focus_area?: string;
  referral_source?: string;
}
```

**OnboardingResponse:**
```typescript
interface OnboardingResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    status?: string;
    focus_area?: string;
    referral_source?: string;
    onboarding_completed_at: string;
  };
}
```

## Schemas

### onboardingSchema

Located at `src/features/onboarding/schemas/onboardingSchema.ts`

Zod schema for validating onboarding data:

```typescript
const onboardingSchema = z.object({
  status: z.string().max(255).optional(),
  focus_area: z.string().max(255).optional(),
  referral_source: z.string().max(255).optional(),
});
```

## Protected Route Logic

The `ProtectedRoute` component now checks if a user needs onboarding:

1. Checks if user is authenticated
2. If authenticated, checks if `onboarding_completed_at` is null
3. If null and not on `/onboarding`, redirects to `/onboarding`
4. Otherwise, renders the protected content

## User Data Flow

1. User logs in/registers → receives user object with `onboarding_completed_at: null`
2. App fetches current user on mount
3. `ProtectedRoute` detects missing onboarding → redirects to `/onboarding`
4. User completes onboarding → `onboarding_completed_at` is set
5. User is redirected to dashboard

## Focus Areas

The following focus areas are available:
- Medical 💊
- Engineering 👷
- Nursing 💉
- Computer Science 💻
- Law ⚖️
- Education 📚
- Arts & Design 🎨
- Languages 🌐
- Psychology 💡
- Others ✏️

## Referral Sources

The following referral sources are available:
- Friends or Family 👥
- Podcast 🎙️
- Youtube ▶️
- Email ✉️
- Google Search 🔍
- Blog or Forum 📰
- Work 📋
- Others ℹ️

## Routes

- `/onboarding`: Protected route for onboarding flow (no sidebar/navbar)

## Integration with Auth

The `User` type in `src/common/types/auth.ts` has been extended to include:
```typescript
status?: string;
focus_area?: string;
referral_source?: string;
onboarding_completed_at?: string | null;
```

## API Integration

The feature integrates with the backend onboarding API:
- Endpoint: `POST /api/auth/onboarding`
- See API documentation for full details

## Styling

The onboarding page uses:
- Tailwind CSS for all styling
- Mobile-first responsive design
- Clean, minimal UI with centered layout
- Interactive hover states on selection cards
- Loading indicators during API calls

