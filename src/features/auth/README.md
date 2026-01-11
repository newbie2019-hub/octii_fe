# Authentication Feature

## Overview

A complete authentication system with email/password login and registration, following the project's architecture standards.

## Features

- ✅ User Registration with validation
- ✅ User Login
- ✅ Protected Routes
- ✅ Token-based authentication (Bearer)
- ✅ Automatic token storage in localStorage
- ✅ Form validation with Zod
- ✅ Loading states for all forms
- ✅ Error handling with toast notifications
- ✅ Clean, centered UI with shadcn/ui components

## Structure

```
src/
├── features/auth/
│   ├── components/
│   │   ├── LoginForm.tsx       # Login form component
│   │   └── RegisterForm.tsx    # Registration form component
│   ├── hooks/
│   │   ├── useLogin.ts         # Login logic
│   │   ├── useRegister.ts      # Registration logic
│   │   └── useLogout.ts        # Logout logic
│   ├── schemas/
│   │   ├── loginSchema.ts      # Zod validation for login
│   │   └── registerSchema.ts   # Zod validation for registration
│   ├── services/
│   │   └── authService.ts      # API calls
│   └── index.ts                # Public API exports
├── store/
│   └── authStore.ts            # Zustand auth state management
├── pages/
│   ├── LoginPage.tsx           # Login page
│   ├── RegisterPage.tsx        # Register page
│   └── HomePage.tsx            # Protected home page
├── layouts/
│   └── AuthLayout.tsx          # Auth page layout wrapper
└── common/
    ├── components/
    │   └── ProtectedRoute.tsx  # Route guard component
    ├── types/
    │   └── auth.ts             # Auth TypeScript types
    └── utils/
        └── api.ts              # Axios instance with interceptors
```

## Configuration

The API base URL is configured via environment variable:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Update `.env` file to match your backend API URL.

## Usage

### Login

Navigate to `/login` to access the login page. Users can sign in with their email and password.

### Register

Navigate to `/register` to create a new account. Password requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Protected Routes

Routes wrapped with `<ProtectedRoute>` will automatically redirect unauthenticated users to the login page.

Example:
```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### Using Auth State

Access auth state anywhere in your app:

```tsx
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return <div>Welcome {user?.name}</div>;
}
```

### Logout

```tsx
import { useLogout } from '@/features/auth';

function MyComponent() {
  const { logout } = useLogout();

  return <button onClick={logout}>Sign out</button>;
}
```

## API Integration

The authentication system is fully integrated with the Laravel backend API documented in:
`/Users/yvansabay/Documents/Personal/Octii/api/md/authentication-api-documentation.md`

Implemented endpoints:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout current device
- `GET /api/auth/me` - Get current user (ready for use)

Ready for future implementation:
- `POST /api/auth/logout-all` - Logout all devices
- `GET /api/auth/{provider}/redirect` - Social auth redirect
- `GET /api/auth/{provider}/callback` - Social auth callback
- `POST /api/auth/unlink-social` - Unlink social provider

## Security

- Tokens are stored in localStorage
- Automatic token injection via Axios interceptors
- Automatic redirect on 401 (Unauthorized) responses
- Token expiration: 30 days (as per API spec)

## Next Steps

To extend this authentication system:

1. **Email Verification**: Add email verification flow
2. **Password Reset**: Implement forgot password functionality
3. **Social Auth**: Add Google/GitHub OAuth buttons
4. **Remember Me**: Add persistent login option
5. **Multi-device Management**: Show active sessions
6. **Profile Management**: Create user profile editing feature

