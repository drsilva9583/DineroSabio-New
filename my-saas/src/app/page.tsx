"use client";
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';

export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <main className="mx-auto px-6 py-8 grid place-items-center h-screen">
      <h1 className="text-4xl font-bold">Dinero Sabio</h1>

      <p>
        A beginner-friendly bilingual app to learn saving & investing with interactive lessons.
      </p>
      <div>
        <SignedOut>
          <SignInButton>
            <button className="bg-green-600 hover:bg-green-700 rounded-md px-4 py-2">
              Log In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-green-600 hover:bg-green-700 rounded-md px-4 py-2">
              Create an Account
            </button>
          </SignUpButton>
        </SignedOut>
      </div>
      <div className='grid place-items-center mt-4'>
        <SignedIn>
          <p>Welcome back{isLoaded && isSignedIn ? ` ${user.firstName}!` : "!"}</p>
          <Link
            href="/dashboard"
            className="bg-green-600 hover:bg-green-700 rounded-md px-4 py-2"
          >
            Go To Dashboard
          </Link>
        </SignedIn>
      </div>
    </main>
  );
}
