import { NextResponse } from 'next/server';

const NAMESPACE = 'nancy-sharma-portfolio-2025';
const KEY = 'total-visitors';
const BASE = 'https://counterapi.dev/api';

// Maintain in-memory analytics store on global object across server requests
if (!global._analyticsStore) {
  global._analyticsStore = {
    totalVisits: 0,
    sessions: new Set(),
    activeSessions: new Map(), // sessionId -> timestamp
    dailyVisits: {}, // 'YYYY-MM-DD' -> count
    devices: { mobile: 0, desktop: 0 },
    referrers: {}, // referrer -> count
    counterSynced: false,
  };
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function cleanupActiveSessions() {
  const store = global._analyticsStore;
  const now = Date.now();
  const cutoff = now - 5 * 60 * 1000; // 5 minute active window
  for (const [sessId, ts] of store.activeSessions.entries()) {
    if (ts < cutoff) {
      store.activeSessions.delete(sessId);
    }
  }
}

function getLast7DaysData() {
  const store = global._analyticsStore;
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      count: store.dailyVisits[dateStr] || 0,
    });
  }
  return days;
}

async function fetchGlobalCounter() {
  try {
    const res = await fetch(`${BASE}/${NAMESPACE}/${KEY}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.value === 'number') {
        global._analyticsStore.totalVisits = Math.max(global._analyticsStore.totalVisits, data.value);
      }
    }
  } catch {}
}

async function incrementGlobalCounter() {
  try {
    const res = await fetch(`${BASE}/${NAMESPACE}/${KEY}/up`, { method: 'GET', cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.value === 'number') {
        global._analyticsStore.totalVisits = Math.max(global._analyticsStore.totalVisits, data.value);
        return data.value;
      }
    }
  } catch {}
  global._analyticsStore.totalVisits += 1;
  return global._analyticsStore.totalVisits;
}

// GET: Fetch real-time analytics data (heartbeat & page refreshes)
export async function GET(request) {
  const store = global._analyticsStore;
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (sessionId) {
    store.sessions.add(sessionId);
    store.activeSessions.set(sessionId, Date.now());
  }

  cleanupActiveSessions();

  if (!store.counterSynced) {
    await fetchGlobalCounter();
    store.counterSynced = true;
  }

  const todayKey = getTodayKey();

  return NextResponse.json({
    totalVisits: store.totalVisits,
    todayVisits: store.dailyVisits[todayKey] || 0,
    uniqueSessions: store.sessions.size,
    activeVisitors: Math.max(store.activeSessions.size, 1),
    chartData: getLast7DaysData(),
    deviceBreakdown: {
      mobile: store.devices.mobile,
      desktop: store.devices.desktop,
    },
    referrers: store.referrers,
  });
}

// POST: Increment visit count ONLY for brand new sessions
export async function POST(request) {
  const store = global._analyticsStore;
  let body = {};
  try {
    body = await request.json();
  } catch {}

  const { sessionId, device = 'desktop', referrer = 'Direct' } = body;
  const todayKey = getTodayKey();

  if (sessionId) {
    store.sessions.add(sessionId);
    store.activeSessions.set(sessionId, Date.now());
  }

  await incrementGlobalCounter();

  store.dailyVisits[todayKey] = (store.dailyVisits[todayKey] || 0) + 1;

  if (device === 'mobile') {
    store.devices.mobile += 1;
  } else {
    store.devices.desktop += 1;
  }

  store.referrers[referrer] = (store.referrers[referrer] || 0) + 1;

  cleanupActiveSessions();

  return NextResponse.json({
    totalVisits: store.totalVisits,
    todayVisits: store.dailyVisits[todayKey],
    uniqueSessions: store.sessions.size,
    activeVisitors: Math.max(store.activeSessions.size, 1),
    chartData: getLast7DaysData(),
    deviceBreakdown: {
      mobile: store.devices.mobile,
      desktop: store.devices.desktop,
    },
    referrers: store.referrers,
  });
}
