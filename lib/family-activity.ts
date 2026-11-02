import { isSupabaseConfigured, supabase } from "./supabase";

function requireSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
  }
}

export type LeaderboardEntry = {
  id: string;
  memberName: string;
  totalPoints: number;
  activityCount: number;
};

type LeaderboardRow = {
  id: string;
  member_name: string;
  total_points: number;
  activity_count: number;
};

async function getOrCreateFamilyMember(name: string) {
  const { data: existing, error: lookupError } = await supabase
    .from("family_members")
    .select("id, name")
    .ilike("name", name)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("family_members")
    .insert({ name })
    .select("id, name")
    .single();

  if (error?.code === "23505") {
    const { data: raced, error: racedError } = await supabase
      .from("family_members")
      .select("id, name")
      .ilike("name", name)
      .single();

    if (racedError) {
      throw racedError;
    }

    return raced;
  }

  if (error) {
    throw error;
  }

  return data;
}

async function getOrCreateActivity(name: string) {
  const { data: existing, error: lookupError } = await supabase
    .from("activities")
    .select("id, name")
    .ilike("name", name)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("activities")
    .insert({ name })
    .select("id, name")
    .single();

  if (error?.code === "23505") {
    const { data: raced, error: racedError } = await supabase
      .from("activities")
      .select("id, name")
      .ilike("name", name)
      .single();

    if (racedError) {
      throw racedError;
    }

    return raced;
  }

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  requireSupabase();

  const { data, error } = await supabase
    .from("leaderboard")
    .select("id, member_name, total_points, activity_count")
    .order("total_points", { ascending: false })
    .order("member_name", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as LeaderboardRow[]).map((row) => ({
    id: row.id,
    memberName: row.member_name,
    totalPoints: row.total_points,
    activityCount: row.activity_count,
  }));
}

export async function logActivity(input: {
  memberName: string;
  activityName: string;
  points: number;
}) {
  requireSupabase();

  const member = await getOrCreateFamilyMember(input.memberName);
  const activity = await getOrCreateActivity(input.activityName);

  const { error } = await supabase.from("points").insert({
    family_member_id: member.id,
    activity_id: activity.id,
    points: input.points,
  });

  if (error) {
    throw error;
  }
}
