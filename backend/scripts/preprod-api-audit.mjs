/**
 * Pre-production API audit (Phases B–E helpers).
 * Usage: node scripts/preprod-api-audit.mjs
 */
const base = process.env.API_URL || 'http://localhost:4000';

async function req(method, path, body, token) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text.slice(0, 200);
  }
  return { status: res.status, json, text };
}

const results = [];
function record(phase, name, ok, detail) {
  results.push({ phase, name, ok, detail });
  console.log(ok ? 'PASS' : 'FAIL', `[${phase}]`, name, typeof detail === 'string' ? detail : JSON.stringify(detail).slice(0, 120));
}

// Phase B — Fitness public
const fitnessPublic = [
  '/api/health',
  '/api/categories',
  '/api/videos',
  '/api/packages',
  '/api/reviews',
  '/api/success-stories',
  '/api/faqs',
];
for (const p of fitnessPublic) {
  const r = await req('GET', p);
  const sample = JSON.stringify(r.json).slice(0, 500);
  const hasSupabaseStorage = sample.includes('supabase.co/storage');
  record('B', `GET ${p}`, r.status === 200, { status: r.status, supabaseStorage: hasSupabaseStorage });
}

// Phase C — Squash public
const squashPublic = [
  '/api/squash/health',
  '/api/squash/categories',
  '/api/squash/videos',
  '/api/squash/packages',
  '/api/squash/reviews',
  '/api/squash/success-stories',
  '/api/squash/faqs',
  '/api/squash/coaches',
  '/api/squash/programs',
];
for (const p of squashPublic) {
  const r = await req('GET', p);
  record('C', `GET ${p}`, r.status === 200, { status: r.status });
}

const login = await req('POST', '/api/auth/login', {
  email: process.env.E2E_COACH_EMAIL || 'admin@gmail.com',
  password: process.env.E2E_COACH_PASSWORD || '12345678',
});
record('B', 'coach login', login.status === 200 && login.json?.accessToken, { status: login.status });
if (!login.json?.accessToken) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
}
const token = login.json.accessToken;

// Fitness category CRUD sample
const catName = `Preprod Cat ${Date.now()}`;
const catCreate = await req(
  'POST',
  '/api/categories',
  { nameEn: catName, nameAr: catName, isPublic: true },
  token
);
const catId = catCreate.json?.id;
record('B', 'POST /api/categories', catCreate.status === 201 && catId, { status: catCreate.status, catId });
if (catId) {
  const catDel = await req('DELETE', `/api/categories/${catId}`, null, token);
  record('B', 'DELETE /api/categories/:id', catDel.status === 200, { status: catDel.status });
}

// Phase D — fitness access
const videos = await req('GET', '/api/videos', null, token);
const videoList = Array.isArray(videos.json) ? videos.json : videos.json?.data;
const videoId = videoList?.[0]?.id;
const coachId = login.json.user?.id;
if (videoId && coachId) {
  const g = await req('PUT', `/api/videos/${videoId}/access`, { userIds: [coachId] }, token);
  record('D', 'PUT fitness video access', g.status === 200, { status: g.status });
  const r = await req('PUT', `/api/videos/${videoId}/access`, { userIds: [] }, token);
  record('D', 'revoke fitness video access', r.status === 200, { status: r.status });
}

console.log('\n--- SUMMARY ---');
const failed = results.filter((x) => !x.ok);
console.log(`Total: ${results.length}, Passed: ${results.length - failed.length}, Failed: ${failed.length}`);
if (failed.length) process.exit(1);
