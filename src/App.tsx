import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { useEffect } from "react"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { DashboardPage } from "./pages/DashboardPage"
import DecksPage from "./pages/DecksPage"
import DeckPage from "./pages/DeckPage"
import CreateDeckPage from "./pages/CreateDeckPage"
import AddCardsPage from "./pages/AddCardsPage"
import ImportHistoryPage from "./pages/ImportHistoryPage"
import { CardsPage } from "./pages/CardsPage"
import { TagsPage } from "./pages/TagsPage"
import { SettingsPage } from "./pages/SettingsPage"
import { OnboardingPage } from "./pages/OnboardingPage"
import StudySessionPage from "./pages/StudySessionPage"
import { ProtectedRoute } from "./common/components/ProtectedRoute"
import { MainLayout } from "./layouts/MainLayout"
import { useAuthStore } from "./store/authStore"
import { authService } from "./features/auth/services/authService"

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)

  // Fetch user data on mount if authenticated
  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated) {
        setLoading(true)
        try {
          const response = await authService.getCurrentUser()
          setUser(response.user)
        } catch (error) {
          console.error("Failed to fetch user:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUser()
  }, [isAuthenticated, setUser, setLoading])

  // Determine redirect path for authenticated users
  const getAuthRedirectPath = () => {
    if (!isAuthenticated) return null
    // If user hasn't completed onboarding, redirect to onboarding
    if (user && !user.onboarding_completed_at) {
      return "/onboarding"
    }
    // Otherwise, redirect to dashboard
    return "/dashboard"
  }

  const authRedirectPath = getAuthRedirectPath()

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-left"
        richColors
      />
      <Routes>
        {/* Public routes - redirect based on onboarding status if authenticated */}
        <Route
          path="/login"
          element={
            authRedirectPath ? (
              <Navigate
                to={authRedirectPath}
                replace
              />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/register"
          element={
            authRedirectPath ? (
              <Navigate
                to={authRedirectPath}
                replace
              />
            ) : (
              <RegisterPage />
            )
          }
        />

        {/* Onboarding route - protected but without MainLayout */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Protected routes with MainLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DecksPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks/create"
          element={
            <ProtectedRoute>
              <CreateDeckPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DeckPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks/:id/add-cards"
          element={
            <ProtectedRoute>
              <AddCardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks/:deckId/study"
          element={
            <ProtectedRoute>
              <StudySessionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/import-history"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ImportHistoryPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cards"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CardsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tags"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TagsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SettingsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* Catch all - redirect to login */}
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
