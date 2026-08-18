import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const kv = Redis.fromEnv();

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

async function fetchAnalyticsData() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const last7Days = getLast7Days();
  const dailyKeys = last7Days.map((d) => `visits:daily:${d}`);

  const [
    totalVisitsRaw,
    todayVisitsRaw,
    uniqueSessionsRaw,
    activeVisitorsRaw,
    dailyCountsRaw,
    deviceCountsRaw,
  ] = await Promise.all([
    kv.get('total_visits'),
    kv.get(`visits:daily:${todayStr}`),
    kv.scard('unique_sessions'),
    kv.zcard('active_sessions'),
    kv.mget(...dailyKeys),
    kv.mget('device:mobile', 'device:desktop'),
  ]);

  const chartData = last7Days.map((dateStr, i) => ({
    date: dateStr,
    count: Number(dailyCountsRaw?.[i] || 0),
  }));

  const mobile = Number(deviceCountsRaw?.[0] || 0);
  const desktop = Number(deviceCountsRaw?.[1] || 0);

  return {
    totalVisits: Number(totalVisitsRaw || 0),
    todayVisits: Number(todayVisitsRaw || 0),
    uniqueSessions: Number(uniqueSessionsRaw || 0),
    activeVisitors: Number(activeVisitorsRaw || 0),
    chartData,
    deviceBreakdown: {
      mobile,
      desktop,
    },
  };
}

// GET: Fetch real-time analytics & refresh active session timestamp
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const now = Date.now();

    // Refresh active session timestamp if sessionId exists
    if (sessionId) {
      await kv.zadd('active_sessions', { score: now, member: sessionId });
    }

    // Prune active_sessions older than 60 seconds (score <= now - 60000)
    await kv.zremrangebyscore('active_sessions', 0, now - 60000);

    const data = await fetchAnalyticsData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('KV Analytics GET Error:', error);
    return NextResponse.json(
      { error: 'Connecting to analytics server' },
      { status: 503 }
    );
  }
}

// POST: Increment analytics counters for new sessions
export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {}

    const { sessionId, device = 'desktop' } = body;
    const now = Date.now();
    const todayStr = new Date().toISOString().slice(0, 10);
    const deviceKey = device === 'mobile' ? 'device:mobile' : 'device:desktop';

    // Atomic increments & updates
    await Promise.all([
      kv.incr('total_visits'),
      kv.incr(`visits:daily:${todayStr}`),
      kv.incr(deviceKey),
      ...(sessionId
        ? [
            kv.sadd('unique_sessions', sessionId),
            kv.zadd('active_sessions', { score: now, member: sessionId }),
          ]
        : []),
    ]);

    // Prune active_sessions older than 60 seconds (score <= now - 60000)
    await kv.zremrangebyscore('active_sessions', 0, now - 60000);

    const data = await fetchAnalyticsData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('KV Analytics POST Error:', error);
    return NextResponse.json(
      { error: 'Connecting to analytics server' },
      { status: 503 }
    );
  }
}
