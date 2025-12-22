import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <main className="mx-auto px-6 py-10 grid place-items-center h-screen">
      <h1 className="text-4xl font-bold">Dinero Sabio</h1>

      <p>
        A beginner-friendly bilingual app to learn saving & investing with interactive lessons.
      </p>
      <div>
        <SignedOut>
          <SignInButton>
            <button className="rounded-md px-4 py-2">
              Log In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="rounded-md px-4 py-2">
              Create an Account
            </button>
          </SignUpButton>
        </SignedOut>
      </div>
      <div>
        <SignedIn>
          <Link
            href="/dashboard"
          >
            Go To Dashboard
          </Link>
        </SignedIn>
      </div>
    </main>
  );
}
