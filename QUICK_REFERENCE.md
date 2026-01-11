# Quick Reference Guide

## Common Tasks

### Start Development Server
```bash
cd /Users/yvansabay/Documents/Personal/Octii/app
pnpm dev
```
Access at: http://localhost:5173/

### Build for Production
```bash
pnpm build
```

### Preview Production Build
```bash
pnpm preview
```

### Run Linter
```bash
pnpm lint
```

## Environment Configuration

Edit `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Change the URL to match your backend API endpoint.

## Common Code Snippets

### Use Auth State in a Component
```tsx
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!user) return <div>Loading...</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

### Protect a Route
```tsx
import { ProtectedRoute } from '@/common/components/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### Make an Authenticated API Call
```tsx
import { api } from '@/common/utils/api';

// Token is automatically included
async function fetchUserData() {
  const response = await api.get('/user/profile');
  return response.data;
}
```

### Use the Logout Hook
```tsx
import { useLogout } from '@/features/auth';

function Header() {
  const { logout } = useLogout();

  return (
    <button onClick={logout}>
      Sign out
    </button>
  );
}
```

### Create a New Form with Validation

1. **Create Zod Schema** (e.g., `src/features/myfeature/schemas/mySchema.ts`):
```tsx
import { z } from 'zod';

export const MyFormSchema = z.object({
  field1: z.string().min(1, 'Field is required'),
  field2: z.string().email('Invalid email'),
});

export type MyFormValues = z.infer<typeof MyFormSchema>;
```

2. **Create Form Component** (e.g., `src/features/myfeature/components/MyForm.tsx`):
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MyFormSchema, type MyFormValues } from '../schemas/mySchema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function MyForm() {
  const form = useForm<MyFormValues>({
    resolver: zodResolver(MyFormSchema),
    mode: 'onTouched',
    defaultValues: {
      field1: '',
      field2: '',
    },
  });

  const onSubmit = async (data: MyFormValues) => {
    // Handle submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="field1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field 1</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## File Structure Quick Reference

```
src/
├── features/          # Feature modules (domain-driven)
│   └── auth/
│       ├── components/    # UI components
│       ├── hooks/         # Business logic
│       ├── services/      # API calls
│       ├── schemas/       # Validation
│       └── index.ts       # Public exports
│
├── common/           # Shared utilities
│   ├── components/   # Reusable components
│   ├── hooks/        # Shared hooks
│   ├── utils/        # Helper functions
│   └── types/        # Global types
│
├── pages/            # Route components
├── layouts/          # Page wrappers
├── store/            # Global state (Zustand)
└── components/ui/    # Design system (Shadcn)
```

## Import Path Examples

```tsx
// Feature imports (use public API)
import { useLogin, LoginForm } from '@/features/auth';

// Common utilities
import { api } from '@/common/utils/api';
import { ProtectedRoute } from '@/common/components/ProtectedRoute';

// Store
import { useAuthStore } from '@/store/authStore';

// UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Pages (only in App.tsx routing)
import { LoginPage } from '@/pages/LoginPage';
```

## Debugging Tips

### Check Auth State
Open browser console and run:
```javascript
localStorage.getItem('auth_token')
```

### Clear Auth State
```javascript
localStorage.removeItem('auth_token')
// Then refresh the page
```

### Check API Calls
Open Network tab in browser DevTools:
- Look for requests to your API
- Check request headers for Authorization: Bearer {token}
- Check response status codes

### Common Issues

#### "Unauthenticated" error
- Check if token exists: `localStorage.getItem('auth_token')`
- Verify backend API is running
- Check API URL in `.env` file

#### Infinite redirect loop
- Check ProtectedRoute logic
- Verify auth state is updating correctly
- Check browser console for errors

#### Form not submitting
- Check browser console for validation errors
- Verify Zod schema validation
- Check network tab for API errors

## Toast Notifications

```tsx
import { toast } from 'sonner';

// Success
toast.success('Action completed successfully');

// Error
toast.error('Something went wrong');

// Info
toast.info('Information message');

// Warning
toast.warning('Warning message');
```

## Accessing User Info

```tsx
const user = useAuthStore((state) => state.user);

console.log(user?.id);       // User ID
console.log(user?.name);     // User name
console.log(user?.email);    // User email
console.log(user?.avatar);   // Avatar URL
console.log(user?.provider); // OAuth provider (if any)
```

## API Service Methods Available

```tsx
import { authService } from '@/features/auth';

// Registration
await authService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Password123',
  password_confirmation: 'Password123',
});

// Login
await authService.login({
  email: 'john@example.com',
  password: 'Password123',
});

// Logout current device
await authService.logout();

// Logout all devices
await authService.logoutAll();

// Get current user
await authService.getCurrentUser();

// Get OAuth redirect URL
await authService.getSocialRedirect('google');

// Unlink social provider
await authService.unlinkSocial();
```

## Useful VS Code / Cursor Shortcuts

- `Cmd+P` - Quick file search
- `Cmd+Shift+F` - Search in all files
- `F12` - Go to definition
- `Shift+F12` - Find all references
- `Cmd+.` - Quick fix / actions

## Testing URLs

- **Login**: http://localhost:5173/login
- **Register**: http://localhost:5173/register
- **Home (protected)**: http://localhost:5173/
- **Any other route**: Redirects to login if not authenticated

---

## 📚 Full Documentation

- **Setup Guide**: `AUTH_SETUP.md`
- **Flow Diagrams**: `AUTHENTICATION_FLOW.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **UI Preview**: `UI_PREVIEW.md`
- **Checklist**: `IMPLEMENTATION_CHECKLIST.md`
- **Feature Docs**: `src/features/auth/README.md`
- **API Documentation**: `/Users/yvansabay/Documents/Personal/Octii/api/md/authentication-api-documentation.md`

---

Keep this file handy for quick reference while developing! 🚀

