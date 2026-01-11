import { Link } from 'react-router-dom';
import { RegisterForm, GoogleButton } from '@/features/auth';
import { AuthLayout } from '@/layouts/AuthLayout';

export function RegisterPage() {
  return (
    <AuthLayout
      title="Get Started with Recallify"
      description="Build knowledge, track habits, and improve retention with Recallify."
    >
      <div className="space-y-4">
        <GoogleButton />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              or
            </span>
          </div>
        </div>

        <RegisterForm />

        <div className="text-center text-sm text-muted-foreground">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

