
// Optional Supabase-backed leaderboards
// Provide SUPABASE_URL and SUPABASE_ANON_KEY in /js/config.js (copy config.example.js and fill values).
// You must create a table with Row Level Security (RLS) rules to protect writes.
//
// SQL schema suggestion:
//   create table scores (
//     id bigserial primary key,
//     game_id text not null,
//     name text not null,
//     score int not null check (score >= 0),
//     created_at timestamptz default now()
//   );
//   create index on scores (game_id, score desc);
//   -- RLS: allow insert/select for anon, but limit rate in middleware (edge) or via policies as needed.
//   alter table scores enable row level security;
//   create policy "public readable" on scores for select using (true);
//   create policy "public insert" on scores for insert with check (true);

window.GamefariSupabase = (function(){
  function isConfigured(){
    return !!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY);
  }
  async function addScore(gameId, name, score){
    const url = window.SUPABASE_URL + "/rest/v1/scores";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "apikey": window.SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + window.SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({ game_id: gameId, name, score })
    });
    if (!res.ok) throw new Error("Supabase insert failed: " + res.status);
    return await topScores(gameId);
  }
  async function topScores(gameId, limit=50){
    const url = `${window.SUPABASE_URL}/rest/v1/scores?game_id=eq.${encodeURIComponent(gameId)}&select=*&order=score.desc,created_at.asc&limit=${limit}`;
    const res = await fetch(url, {
      headers: { "apikey": window.SUPABASE_ANON_KEY, "Authorization": "Bearer " + window.SUPABASE_ANON_KEY }
    });
    if (!res.ok) throw new Error("Supabase select failed: " + res.status);
    const rows = await res.json();
    return rows.map(r => ({ name: r.name, score: r.score, at: Date.parse(r.created_at || Date.now()) }));
  }
  return { isConfigured, addScore, topScores };
})();
