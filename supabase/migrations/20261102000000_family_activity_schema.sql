create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  constraint family_members_name_key unique (name)
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  constraint activities_name_key unique (name)
);

create table if not exists points (
  id uuid primary key default gen_random_uuid(),
  family_member_id uuid not null references family_members (id) on delete cascade,
  activity_id uuid not null references activities (id) on delete cascade,
  points integer not null check (points > 0),
  created_at timestamptz not null default now()
);

create index if not exists points_family_member_id_idx on points (family_member_id);
create index if not exists points_activity_id_idx on points (activity_id);

create or replace view leaderboard
  with (security_invoker = true)
as
select
  family_members.id,
  family_members.name as member_name,
  coalesce(sum(points.points), 0)::integer as total_points,
  count(points.id)::integer as activity_count
from family_members
left join points on points.family_member_id = family_members.id
group by family_members.id, family_members.name;

alter table family_members enable row level security;
alter table activities enable row level security;
alter table points enable row level security;

create policy "Anyone can read family members"
  on family_members for select using (true);
create policy "Anyone can add family members"
  on family_members for insert with check (true);

create policy "Anyone can read activities"
  on activities for select using (true);
create policy "Anyone can add activities"
  on activities for insert with check (true);

create policy "Anyone can read points"
  on points for select using (true);
create policy "Anyone can add points"
  on points for insert with check (true);

grant select, insert on family_members, activities, points to anon, authenticated;
grant select on leaderboard to anon, authenticated;
