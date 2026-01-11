import { Link } from "react-router-dom"
import { LoginForm, GoogleButton } from "@/features/auth"
import { AuthLayout } from "@/layouts/AuthLayout"

export function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      description="Pick up where you left off and keep your learning streak alive."
    >
      <div className="space-y-4">
        <GoogleButton />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <LoginForm />

        <div className="text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link
            to="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
