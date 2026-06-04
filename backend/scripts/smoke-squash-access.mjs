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
    json = text;
  }
  return { status: res.status, json };
}

const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(ok ? 'PASS' : 'FAIL', name, typeof detail === 'string' ? detail : JSON.stringify(detail));
}

const login = await req('POST', '/api/auth/login', {
  email: 'admin@gmail.com',
  password: '12345678',
});
record(
  'coach login',
  login.status === 200 && login.json?.accessToken,
  login.status === 200 ? { userId: login.json.user?.id } : login
);

if (!login.json?.accessToken) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
}

const token = login.json.accessToken;
const coachId = login.json.user.id;

const videos = await req('GET', '/api/squash/videos', null, token);
const videoList = Array.isArray(videos.json) ? videos.json : videos.json?.data;
const videoId = videoList?.[0]?.id;
record('list squash videos', videos.status === 200 && videoId, { status: videos.status, videoId });

if (!videoId) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
}

const grant = await req('PUT', `/api/squash/videos/${videoId}/access`, { userIds: [coachId] }, token);
record('PUT video access', grant.status === 200, { status: grant.status, body: grant.json });

const verifyVideo = await req('GET', `/api/squash/videos/${videoId}/access`, null, token);
const ids = Array.isArray(verifyVideo.json) ? verifyVideo.json : verifyVideo.json?.userIds;
const hasGrant = Array.isArray(ids) && ids.includes(coachId);
record('GET video access verify', verifyVideo.status === 200 && hasGrant, {
  status: verifyVideo.status,
  ids,
});

const traineeGet = await req('GET', `/api/squash/access/trainee/${coachId}`, null, token);
record('GET trainee access', traineeGet.status === 200, {
  status: traineeGet.status,
  body: traineeGet.json,
});

const traineePut = await req(
  'PUT',
  `/api/squash/access/trainee/${coachId}`,
  { categoryIds: [], videoIds: [videoId] },
  token
);
record('PUT trainee access', traineePut.status === 200, { status: traineePut.status });

const traineeVerify = await req('GET', `/api/squash/access/trainee/${coachId}`, null, token);
const videoRows = traineeVerify.json?.videos ?? [];
const traineeOk =
  traineeVerify.status === 200 &&
  videoRows.some((r) => (r.video_id ?? r.videoId) === videoId);
record('GET trainee access verify', traineeOk, traineeVerify.json);

const allOk = results.every((r) => r.ok);
console.log('\nSummary:', allOk ? 'ALL PASS' : 'SOME FAILED');
process.exit(allOk ? 0 : 1);
