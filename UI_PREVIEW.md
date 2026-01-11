# UI Preview - Authentication Pages

## Login Page (`/login`)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                  Gradient Background                           │
│              (slate-50 to slate-100)                          │
│                                                                │
│            ┌──────────────────────────────┐                   │
│            │                              │                   │
│            │      Welcome back           │  ← Card Title     │
│            │  Sign in to your account    │  ← Description    │
│            │      to continue            │                   │
│            │                              │                   │
│            ├──────────────────────────────┤                   │
│            │                              │                   │
│            │  Email                       │  ← Label         │
│            │  ┌────────────────────────┐  │                   │
│            │  │ you@example.com        │  │  ← Input         │
│            │  └────────────────────────┘  │                   │
│            │                              │                   │
│            │  Password                    │  ← Label         │
│            │  ┌────────────────────────┐  │                   │
│            │  │ ••••••••               │  │  ← Input         │
│            │  └────────────────────────┘  │                   │
│            │                              │                   │
│            │  ┌────────────────────────┐  │                   │
│            │  │      Sign in           │  │  ← Button        │
│            │  └────────────────────────┘  │                   │
│            │                              │                   │
│            │  ──────────────────────────  │  ← Separator     │
│            │                              │                   │
│            │  Don't have an account?     │                   │
│            │  Sign up                    │  ← Link          │
│            │                              │                   │
│            └──────────────────────────────┘                   │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Register Page (`/register`)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                  Gradient Background                           │
│              (slate-50 to slate-100)                          │
│                                                                │
│            ┌──────────────────────────────┐                   │
│            │                              │                   │
│            │   Create an account          │  ← Card Title     │
│            │  Get started with your       │  ← Description    │
│            │      free account            │                   │
│            │                              │                   │
│            ├──────────────────────────────┤                   │
│            │                              │                   │
│            │  Name                        │  ← Label         │
│            │  ┌────────────────────────┐  │                   │
│            │  │ John Doe               │  │  ← Input         │
│            │  └────────────────────────┘  │                   │
│            │                              │                   │
│            │  Email                       │  ← Label         │
│            │  ┌────────────────────────┐  │                   │
│            │  │ you@example.com        │  │  ← Input         │
│            │  └────────────────────────┘  │                   │
│            │                              │                   │
│            │  Password                    │  ← Label         │
│            │  ┌────────────────────────┐  │                   │
│            │  │ ••••••••               │  │  ← Input         │
│            │  └────────────────────────┘  │                   │
│            │                              │                   │
│            │  Confirm Password            │  ← Label         │
│            │  ┌────────────────────────┐  │                   │
│            │  │ ••••••••               │  │  ← Input         │
│            │  └────────────────────────┘  │                   │
│            │                              │                   │
│            │  ┌────────────────────────┐  │                   │
│            │  │  Create account        │  │  ← Button        │
│            │  └────────────────────────┘  │                   │
│            │                              │                   │
│            │  ──────────────────────────  │  ← Separator     │
│            │                              │                   │
│            │  Already have an account?   │                   │
│            │  Sign in                    │  ← Link          │
│            │                              │                   │
│            └──────────────────────────────┘                   │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Home Page (Protected) (`/`)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                  Gradient Background                           │
│              (slate-50 to slate-100)                          │
│                                                                │
│            ┌──────────────────────────────┐                   │
│            │                              │                   │
│            │    Welcome to Octii          │  ← Card Title     │
│            │  You're successfully         │  ← Description    │
│            │     logged in                │                   │
│            │                              │                   │
│            ├──────────────────────────────┤                   │
│            │                              │                   │
│            │  ┌────────────────────────┐  │                   │
│            │  │ User Information       │  │  ← Section        │
│            │  │                        │  │                   │
│            │  │ Name: John Doe         │  │                   │
│            │  │ Email: john@email.com  │  │                   │
│            │  └────────────────────────┘  │                   │
│            │                              │                   │
│            │  ┌────────────────────────┐  │                   │
│            │  │      Sign out          │  │  ← Button        │
│            │  └────────────────────────┘  │                   │
│            │                              │                   │
│            └──────────────────────────────┘                   │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Loading State (During Submit)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                  Gradient Background                           │
│                                                                │
│            ┌──────────────────────────────┐                   │
│            │                              │                   │
│            │      Welcome back           │                   │
│            │  Sign in to your account    │                   │
│            │      to continue            │                   │
│            │                              │                   │
│            ├──────────────────────────────┤                   │
│            │                              │                   │
│            │  Email                       │                   │
│            │  ┌────────────────────────┐  │                   │
│            │  │ you@example.com        │  │  (disabled)      │
│            │  └────────────────────────┘  │                   │
│            │                              │                   │
│            │  Password                    │                   │
│            │  ┌────────────────────────┐  │                   │
│            │  │ ••••••••               │  │  (disabled)      │
│            │  └────────────────────────┘  │                   │
│            │                              │                   │
│            │  ┌────────────────────────┐  │                   │
│            │  │  ⟳  Signing in...     │  │  (spinner + text) │
│            │  └────────────────────────┘  │  (disabled)      │
│            │                              │                   │
│            │  ──────────────────────────  │                   │
│            │                              │                   │
│            │  Don't have an account?     │                   │
│            │  Sign up                    │                   │
│            │                              │                   │
│            └──────────────────────────────┘                   │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Validation Error State

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                  Gradient Background                           │
│                                                                │
│            ┌──────────────────────────────┐                   │
│            │                              │                   │
│            │      Welcome back           │                   │
│            │  Sign in to your account    │                   │
│            │      to continue            │                   │
│            │                              │                   │
│            ├──────────────────────────────┤                   │
│            │                              │                   │
│            │  Email                       │                   │
│            │  ┌────────────────────────┐  │                   │
│            │  │ invalid-email          │  │  (red border)    │
│            │  └────────────────────────┘  │                   │
│            │  ⚠ Please enter a valid     │  (error message) │
│            │     email address            │                   │
│            │                              │                   │
│            │  Password                    │                   │
│            │  ┌────────────────────────┐  │                   │
│            │  │                        │  │  (red border)    │
│            │  └────────────────────────┘  │                   │
│            │  ⚠ Password is required      │  (error message) │
│            │                              │                   │
│            │  ┌────────────────────────┐  │                   │
│            │  │      Sign in           │  │                   │
│            │  └────────────────────────┘  │                   │
│            │                              │                   │
│            │  ──────────────────────────  │                   │
│            │                              │                   │
│            │  Don't have an account?     │                   │
│            │  Sign up                    │                   │
│            │                              │                   │
│            └──────────────────────────────┘                   │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Toast Notification (Success)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│     ┌────────────────────────────────────────┐                │
│     │  ✓  Login successful                   │  ← Toast       │
│     └────────────────────────────────────────┘   (top-center)│
│                                                                │
│                  Gradient Background                           │
│                                                                │
│            ┌──────────────────────────────┐                   │
│            │                              │                   │
│            │    Welcome to Octii          │                   │
│            │                              │                   │
│            └──────────────────────────────┘                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Toast Notification (Error)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│     ┌────────────────────────────────────────┐                │
│     │  ✗  The provided credentials are       │  ← Toast       │
│     │     incorrect.                         │   (top-center)│
│     └────────────────────────────────────────┘   (error)     │
│                                                                │
│                  Gradient Background                           │
│                                                                │
│            ┌──────────────────────────────┐                   │
│            │                              │                   │
│            │      Welcome back           │                   │
│            │                              │                   │
│            └──────────────────────────────┘                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Responsive Design (Mobile)

```
┌──────────────────────┐
│                      │
│   Gradient BG        │
│                      │
│ ┌──────────────────┐ │
│ │                  │ │
│ │  Welcome back   │ │
│ │  Sign in to     │ │
│ │  your account   │ │
│ │                  │ │
│ ├──────────────────┤ │
│ │                  │ │
│ │  Email           │ │
│ │  ┌────────────┐  │ │
│ │  │ email      │  │ │
│ │  └────────────┘  │ │
│ │                  │ │
│ │  Password        │ │
│ │  ┌────────────┐  │ │
│ │  │ ••••••     │  │ │
│ │  └────────────┘  │ │
│ │                  │ │
│ │  ┌────────────┐  │ │
│ │  │  Sign in   │  │ │
│ │  └────────────┘  │ │
│ │                  │ │
│ │  ──────────────  │ │
│ │                  │ │
│ │  Don't have an  │ │
│ │  account?       │ │
│ │  Sign up        │ │
│ │                  │ │
│ └──────────────────┘ │
│                      │
│                      │
└──────────────────────┘
```

## UI/UX Features

### Colors (Tailwind)
- **Background**: Gradient from `slate-50` to `slate-100` (dark: `slate-950` to `slate-900`)
- **Card**: White with shadow-xl
- **Primary**: Default shadcn primary color
- **Destructive**: Red for errors
- **Muted**: Gray for secondary text

### Typography
- **Card Title**: 2xl, bold, tight tracking
- **Description**: Muted foreground color
- **Labels**: Medium weight
- **Links**: Primary color, underline on hover

### Interactive States
- **Hover**: Opacity/brightness changes
- **Focus**: Ring outline (accessibility)
- **Disabled**: Reduced opacity, cursor-not-allowed
- **Loading**: Spinner animation

### Spacing
- **Form fields**: 6 units between fields
- **Card padding**: 6 units
- **Card max-width**: md (28rem / 448px)
- **Page padding**: 4 units

### Accessibility
- **Labels**: Associated with inputs
- **Error messages**: Announced by screen readers
- **Focus indicators**: Visible keyboard navigation
- **Semantic HTML**: Proper form structure
- **ARIA labels**: Where needed

### Animations
- **Page transitions**: Smooth fade-ins
- **Button loading**: Spinner rotation
- **Toast notifications**: Slide in from top
- **Form validation**: Shake on error (built-in)

---

The UI is clean, minimal, and professional. It follows modern design principles and is fully accessible.

