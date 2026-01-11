import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useOnboarding, useCompleteOnboarding } from "@/features/onboarding"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import octiiWelcome from "@/assets/images/octti_welcome.png"
import { useAuthStore } from "@/store/authStore"
import { motion, AnimatePresence } from "framer-motion"

type OnboardingStep = "welcome" | "focus" | "referral" | "complete"

const FOCUS_AREAS = [
  { id: "medical", label: "Medical", icon: "💊" },
  { id: "engineering", label: "Engineering", icon: "👷" },
  { id: "nursing", label: "Nursing", icon: "💉" },
  { id: "agriculture", label: "Agriculture", icon: "🌾" },
  { id: "computer_science", label: "Computer Science", icon: "💻" },
  { id: "law", label: "Law", icon: "⚖️" },
  { id: "education", label: "Education", icon: "📚" },
  { id: "arts_design", label: "Arts & Design", icon: "🎨" },
  { id: "languages", label: "Languages", icon: "🌐" },
  { id: "psychology", label: "Psychology", icon: "💡" },
  { id: "others", label: "Others", icon: "✏️" },
]

const REFERRAL_SOURCES = [
  { id: "friends_family", label: "Friends or Family", icon: "👥" },
  { id: "podcast", label: "Podcast", icon: "🎙️" },
  { id: "youtube", label: "Youtube", icon: "▶️" },
  { id: "email", label: "Email", icon: "✉️" },
  { id: "google_search", label: "Google Search", icon: "🔍" },
  { id: "blog_forum", label: "Blog or Forum", icon: "📰" },
  { id: "work", label: "Work", icon: "📋" },
  { id: "others", label: "Others", icon: "ℹ️" },
]

// Animation variants for smooth staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20, // Start 20px below for optimal smoothness
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 120,
    },
  },
}

export const OnboardingPage = () => {
  const [step, setStep] = useState<OnboardingStep>("welcome")
  const [selectedFocus, setSelectedFocus] = useState<string>("")
  const [selectedReferral, setSelectedReferral] = useState<string>("")

  const navigate = useNavigate()
  const { mutate: updateOnboarding, isPending } = useOnboarding()
  const { mutate: completeOnboarding, isPending: isCompletePending } =
    useCompleteOnboarding()
  const user = useAuthStore((state) => state.user)

  // Welcome screen animation sequence
  useEffect(() => {
    if (step === "welcome") {
      // Transition to focus step after animations complete
      const timer = setTimeout(() => {
        setStep("focus")
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [step])

  // Handle completion step - wait for user to see the message, then navigate
  useEffect(() => {
    if (step === "complete") {
      const timer = setTimeout(() => {
        completeOnboarding({
          onSuccess: () => {
            navigate("/dashboard")
          },
          onError: () => {
            navigate("/dashboard")
          },
        })
      }, 3000) // Show the complete message for 3 seconds
      return () => clearTimeout(timer)
    }
  }, [step, completeOnboarding, navigate])

  const handleFocusNext = () => {
    if (selectedFocus) {
      // Update onboarding with focus area
      updateOnboarding(
        { focus_area: selectedFocus },
        {
          onSuccess: () => {
            setStep("referral")
          },
        },
      )
    }
  }

  const handleReferralSubmit = () => {
    if (selectedReferral) {
      // Update onboarding with referral source
      updateOnboarding(
        { referral_source: selectedReferral },
        {
          onSuccess: () => {
            // Show the complete step - the useEffect will handle completion after a delay
            setStep("complete")
          },
        },
      )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-6"
            >
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="text-4xl font-bold text-center"
              >
                Hi, {user?.name || "there"}!
              </motion.h1>

              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
                src={octiiWelcome}
                alt="Welcome"
                className="w-64 h-64 object-contain"
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 2.1, ease: "easeOut" }}
                className="flex items-center space-x-2 text-muted-foreground"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Getting things ready...</span>
              </motion.div>
            </motion.div>
          )}

          {step === "focus" && (
            <motion.div
              key="focus"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col items-center justify-center space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">
                  Tell us what you're focusing on
                </h2>
                <p className="text-muted-foreground">
                  This helps us personalize your experience
                </p>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full"
              >
                {FOCUS_AREAS.map((area) => (
                  <motion.button
                    key={area.id}
                    variants={itemVariants}
                    onClick={() => setSelectedFocus(area.id)}
                    className={`p-4 rounded-sm border transition-all hover:border-primary ${
                      selectedFocus === area.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-2xl">{area.icon}</span>
                      <span className="text-sm font-medium text-center">
                        {area.label}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>

              <Button
                onClick={handleFocusNext}
                disabled={!selectedFocus || isPending}
                size="lg"
                className="min-w-[200px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Next →</>
                )}
              </Button>

              <div className="flex space-x-2 mt-4">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="h-2 w-2 rounded-full bg-muted" />
                <div className="h-2 w-2 rounded-full bg-muted" />
              </div>
            </motion.div>
          )}

          {step === "referral" && (
            <motion.div
              key="referral"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col items-center justify-center space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">
                  How did you hear about us?
                </h2>
                <p className="text-muted-foreground">
                  Help us understand how you discovered Octii
                </p>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full"
              >
                {REFERRAL_SOURCES.map((source) => (
                  <motion.button
                    key={source.id}
                    variants={itemVariants}
                    onClick={() => setSelectedReferral(source.id)}
                    className={`p-4 rounded-sm border transition-all hover:border-primary ${
                      selectedReferral === source.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-2xl">{source.icon}</span>
                      <span className="text-sm font-medium text-center">
                        {source.label}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>

              <Button
                onClick={handleReferralSubmit}
                disabled={!selectedReferral || isPending || isCompletePending}
                size="lg"
                className="min-w-[200px]"
              >
                {isPending || isCompletePending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>Proceed →</>
                )}
              </Button>

              <div className="flex space-x-2 mt-4">
                <div className="h-2 w-2 rounded-full bg-muted" />
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="h-2 w-2 rounded-full bg-muted" />
              </div>
            </motion.div>
          )}

          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.3,
                  }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                <h1 className="text-4xl font-bold">Welcome to Octii!</h1>
                <p className="text-lg text-muted-foreground">
                  You're all set. Let's get started!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="flex items-center space-x-2 text-muted-foreground mt-8"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Taking you to your dashboard...</span>
              </motion.div>

              <div className="flex space-x-2 mt-4">
                <div className="h-2 w-2 rounded-full bg-muted" />
                <div className="h-2 w-2 rounded-full bg-muted" />
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
