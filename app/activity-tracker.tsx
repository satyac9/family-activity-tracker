"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  fetchLeaderboard,
  logActivity,
  type LeaderboardEntry,
} from "@/lib/family-activity";

export function ActivityTracker() {
  const [memberName, setMemberName] = useState("");
  const [activityName, setActivityName] = useState("");
  const [points, setPoints] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function loadLeaderboard() {
    const entries = await fetchLeaderboard();
    setLeaderboard(entries);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError("");
      setIsLoading(true);
      try {
        const entries = await fetchLeaderboard();
        if (!cancelled) {
          setLeaderboard(entries);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load the leaderboard from Supabase.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedMember = memberName.trim();
    const trimmedActivity = activityName.trim();
    const parsedPoints = Number(points);

    if (!trimmedMember || !trimmedActivity) {
      setError("Please enter a family member name and an activity name.");
      return;
    }

    if (!Number.isFinite(parsedPoints) || parsedPoints <= 0) {
      setError("Points must be a number greater than zero.");
      return;
    }

    setIsSaving(true);

    try {
      await logActivity({
        memberName: trimmedMember,
        activityName: trimmedActivity,
        points: parsedPoints,
      });
      await loadLeaderboard();
      setActivityName("");
      setPoints("");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save this activity to Supabase.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
      <section className="rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-sm shadow-emerald-100/70">
        <h2 className="text-lg font-semibold text-slate-900">Activity logging</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add a family member, activity, and points earned.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">
              Family Member Name
            </span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-emerald-500/30 transition focus:border-emerald-400 focus:ring-4"
              value={memberName}
              onChange={(event) => setMemberName(event.target.value)}
              placeholder="e.g. Maya"
              autoComplete="name"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">
              Activity Name
            </span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-emerald-500/30 transition focus:border-emerald-400 focus:ring-4"
              value={activityName}
              onChange={(event) => setActivityName(event.target.value)}
              placeholder="e.g. Morning run"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Points</span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-emerald-500/30 transition focus:border-emerald-400 focus:ring-4"
              type="number"
              min="1"
              step="1"
              value={points}
              onChange={(event) => setPoints(event.target.value)}
              placeholder="e.g. 10"
            />
          </label>

          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Submit"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Leaderboard</h2>
            <p className="mt-1 text-sm text-slate-500">
              Total points, highest first.
            </p>
          </div>
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {leaderboard.length} {leaderboard.length === 1 ? "member" : "members"}
          </p>
        </div>

        {isLoading ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
            <p className="font-medium text-slate-700">Loading leaderboard…</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
            <p className="font-medium text-slate-700">No points yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Submit the first activity to populate the leaderboard.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Rank</th>
                  <th className="pb-3 pr-4 font-medium">Family member</th>
                  <th className="pb-3 pr-4 font-medium">Activities</th>
                  <th className="pb-3 text-right font-medium">Total points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 pr-4 font-semibold text-emerald-700">
                      {index + 1}
                    </td>
                    <td className="py-3 pr-4 font-medium text-slate-900">
                      {entry.memberName}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {entry.activityCount}
                    </td>
                    <td className="py-3 text-right text-base font-semibold text-slate-900">
                      {entry.totalPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
