import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import { ActivityTracker } from "./activity-tracker";

function AuthControls() {
  return (
    <div className="flex items-center gap-3">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            type="button"
          >
            Sign in
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-br from-emerald-50 via-white to-sky-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Family Activity Tracker
            </p>
            <Suspense fallback={<div className="h-9 w-24 rounded-full bg-emerald-100" />}>
              <AuthControls />
            </Suspense>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Log activities. Watch the leaderboard climb.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Submit points as soon as someone finishes an activity. Totals update
            instantly and stay sorted from first place down.
          </p>
        </header>

        <ActivityTracker />
      </div>
    </div>
  );
}
