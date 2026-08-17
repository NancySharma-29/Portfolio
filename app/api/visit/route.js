import { NextResponse } from 'next/server';

// Using counterapi.dev — a free, persistent, never-resetting counter service.
// Replaces the deprecated countapi.xyz.
// Docs: https://counterapi.dev/
const NAMESPACE = 'nancy-sharma-portfolio-2025';
const KEY       = 'total-visitors';
const BASE      = 'https://counterapi.dev/api';

// GET: read current count without incrementing
export async function GET() {
  try {
    const res = await fetch(`${BASE}/${NAMESPACE}/${KEY}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('counterapi fetch failed');
    const data = await res.json();
    return NextResponse.json({ value: data.value ?? 0 });
  } catch {
    return NextResponse.json({ value: 0 }, { status: 200 });
  }
}

// POST: increment then return new count (one per session, called from client)
export async function POST() {
  try {
    const res = await fetch(`${BASE}/${NAMESPACE}/${KEY}/up`, {
      method: 'GET', // counterapi uses GET for increment
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('counterapi increment failed');
    const data = await res.json();
    return NextResponse.json({ value: data.value ?? 1 });
  } catch {
    return NextResponse.json({ value: 1 }, { status: 200 });
  }
}
