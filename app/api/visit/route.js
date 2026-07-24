import { NextResponse } from 'next/server';

const NAMESPACE = 'nancy-sharma-portfolio-2025';
const KEY = 'visits';
const COUNT_API_BASE = 'https://api.countapi.xyz';

// GET: read current count without incrementing
export async function GET() {
  try {
    const res = await fetch(`${COUNT_API_BASE}/get/${NAMESPACE}/${KEY}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json({ value: data.value ?? 0 });
  } catch {
    return NextResponse.json({ value: 0 }, { status: 200 });
  }
}

// POST: increment then return new count
export async function POST() {
  try {
    const res = await fetch(`${COUNT_API_BASE}/hit/${NAMESPACE}/${KEY}`, {
      method: 'GET', // countapi uses GET for hits
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json({ value: data.value ?? 1 });
  } catch {
    return NextResponse.json({ value: 1 }, { status: 200 });
  }
}
