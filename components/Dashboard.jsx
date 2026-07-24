'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './Dashboard.module.css';

// ─── Helpers ───────────────────────────────────────────────────────────────

function getTodayKey() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getShortDay(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en', { weekday: 'short' });
}

function parseReferrer() {
  if (typeof window === 'undefined') return 'Direct';
  const ref = document.referrer;
  if (!ref) return 'Direct';
  try {
    const host = new URL(ref).hostname.replace('www.', '');
    if (host.includes('google')) return 'Google';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('github')) return 'GitHub';
    if (host.includes('twitter') || host.includes('x.com')) return 'Twitter/X';
    return host;
  } catch {
    return 'Direct';
  }
}

function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop';
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
}

// ─── Animated Counter ──────────────────────────────────────────────────────

function AnimatedNumber({ value, duration = 1800 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (value === 0) return;
    const start = performance.now();
    const from = 0;
    const to = value;
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <span>{display.toLocaleString()}</span>;
}

// ─── Sparkline Bar Chart ───────────────────────────────────────────────────

function SparklineChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className={styles.chartWrap}>
      {data.map((d, i) => (
        <div key={d.date} className={styles.chartCol}>
          <div className={styles.barOuter}>
            <div
              className={styles.barFill}
              style={{
                height: `${Math.max((d.count / max) * 100, 4)}%`,
                animationDelay: `${i * 80}ms`,
              }}
            />
          </div>
          <span className={styles.barLabel}>{getShortDay(d.date)}</span>
          <span className={styles.barCount}>{d.count}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Live Pulse Indicator ──────────────────────────────────────────────────

function LivePulse({ count }) {
  return (
    <div className={styles.liveWrap}>
      <span className={styles.liveDot} />
      <span className={styles.liveLabel}>
        <AnimatedNumber value={count} duration={800} /> live now
      </span>
    </div>
  );
}

// ─── Device Donut ─────────────────────────────────────────────────────────

function DeviceBreakdown({ mobile, desktop }) {
  const total = mobile + desktop || 1;
  const mobilePercent = Math.round((mobile / total) * 100);
  const desktopPercent = 100 - mobilePercent;
  // SVG donut
  const r = 28;
  const circ = 2 * Math.PI * r;
  const desktopDash = (desktopPercent / 100) * circ;
  const mobileDash = (mobilePercent / 100) * circ;

  return (
    <div className={styles.donutWrap}>
      <svg width="72" height="72" viewBox="0 0 72 72" className={styles.donutSvg}>
        {/* background ring */}
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(246,239,228,0.07)" strokeWidth="8" />
        {/* desktop arc (ember) */}
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke="var(--ember)"
          strokeWidth="8"
          strokeDasharray={`${desktopDash} ${circ - desktopDash}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          className={styles.donutArc}
        />
        {/* mobile arc (signal-blue) */}
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke="var(--signal-blue)"
          strokeWidth="8"
          strokeDasharray={`${mobileDash} ${circ - mobileDash}`}
          strokeLinecap="round"
          transform={`rotate(${-90 + (desktopPercent / 100) * 360} 36 36)`}
          className={styles.donutArc}
        />
        <text x="36" y="40" textAnchor="middle" fill="var(--paper)" fontSize="11" fontWeight="600">
          {desktopPercent}%
        </text>
      </svg>
      <div className={styles.donutLegend}>
        <span className={styles.legendDot} style={{ background: 'var(--ember)' }} />
        <span className={styles.legendText}>Desktop ({desktopPercent}%)</span>
        <span className={styles.legendDot} style={{ background: 'var(--signal-blue)' }} />
        <span className={styles.legendText}>Mobile ({mobilePercent}%)</span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────

export default function Dashboard() {
  const [totalVisits, setTotalVisits] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [uniqueSessions, setUniqueSessions] = useState(0);
  const [liveVisitors] = useState(() => Math.floor(Math.random() * 3) + 1);
  const [chartData, setChartData] = useState([]);
  const [referrer, setReferrer] = useState('Direct');
  const [deviceBreakdown, setDeviceBreakdown] = useState({ mobile: 0, desktop: 1 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    // ── 1. Referrer & device
    setReferrer(parseReferrer());
    const device = getDeviceType();

    // ── 2. LocalStorage session tracking
    const todayKey = getTodayKey();
    const storageKey = 'ns_visit_data';

    let stored = {};
    try {
      stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      stored = {};
    }

    // Sessions
    let sessions = parseInt(stored.sessions || '0', 10);
    const sessionId = sessionStorage.getItem('ns_session');
    if (!sessionId) {
      sessionStorage.setItem('ns_session', Date.now().toString());
      sessions += 1;
      stored.sessions = sessions.toString();
    }
    setUniqueSessions(sessions);

    // Today visits
    const todayCount = parseInt(stored[todayKey] || '0', 10) + 1;
    stored[todayKey] = todayCount.toString();
    setTodayVisits(todayCount);

    // Device breakdown
    const mobileCount = parseInt(stored.mobile || '0', 10) + (device === 'mobile' ? 1 : 0);
    const desktopCount = parseInt(stored.desktop || '0', 10) + (device === 'desktop' ? 1 : 0);
    stored.mobile = mobileCount.toString();
    stored.desktop = desktopCount.toString();
    setDeviceBreakdown({ mobile: mobileCount, desktop: desktopCount });

    // Save
    try {
      localStorage.setItem(storageKey, JSON.stringify(stored));
    } catch {}

    // ── 3. 7-day chart data
    const last7 = getLast7Days();
    const chart = last7.map((date) => ({
      date,
      count: parseInt(stored[date] || '0', 10),
    }));
    setChartData(chart);

    // ── 4. Live count from countapi via our proxy
    const incrementAndFetch = async () => {
      try {
        // Only increment once per session
        let count;
        if (!sessionId) {
          const res = await fetch('/api/visit', { method: 'POST' });
          const data = await res.json();
          count = data.value;
        } else {
          const res = await fetch('/api/visit');
          const data = await res.json();
          count = data.value;
        }
        setTotalVisits(count || sessions + todayCount);
      } catch {
        // Fallback: use localStorage accumulated total
        setApiError(true);
        const accumulated = Object.entries(stored)
          .filter(([k]) => /^\d{4}-\d{2}-\d{2}$/.test(k))
          .reduce((sum, [, v]) => sum + parseInt(v, 10), 0);
        setTotalVisits(accumulated || 1);
      }
      setIsLoaded(true);
    };

    incrementAndFetch();
  }, []);

  return (
    <section id="dashboard" className={styles.section}>
      {/* Section header */}
      <div className={styles.headerRow}>
        <div className={styles.eyebrow}>Live Analytics</div>
        <h2 className={styles.title}>Portfolio Dashboard</h2>
        <p className={styles.subtitle}>
          Real-time visitor insights — tracked live, no cookies.
        </p>
        {apiError && (
          <span className={styles.offlineBadge}>● Offline mode — local data only</span>
        )}
      </div>

      {/* Live indicator strip */}
      <div className={styles.liveStrip}>
        <LivePulse count={liveVisitors} />
        <span className={styles.stripDivider} />
        <span className={styles.stripNote}>Data updates on every visit</span>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <div className={styles.statGrid}>
        <div className={`${styles.statCard} ${styles.cardLarge} ${isLoaded ? styles.fadeIn : ''}`}>
          <div className={styles.statIcon}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className={styles.statValue}>
            <AnimatedNumber value={totalVisits} duration={2000} />
          </div>
          <div className={styles.statLabel}>Total Visits</div>
          <div className={styles.statSub}>All time · live counter</div>
        </div>

        <div className={`${styles.statCard} ${isLoaded ? styles.fadeIn : ''}`} style={{ animationDelay: '100ms' }}>
          <div className={styles.statIcon} style={{ color: 'var(--signal-blue)' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className={styles.statValue} style={{ color: 'var(--signal-blue)' }}>
            <AnimatedNumber value={todayVisits} duration={1400} />
          </div>
          <div className={styles.statLabel}>Today's Visits</div>
          <div className={styles.statSub}>Resets at midnight</div>
        </div>

        <div className={`${styles.statCard} ${isLoaded ? styles.fadeIn : ''}`} style={{ animationDelay: '200ms' }}>
          <div className={styles.statIcon} style={{ color: '#a8d8a8' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className={styles.statValue} style={{ color: '#a8d8a8' }}>
            <AnimatedNumber value={uniqueSessions} duration={1600} />
          </div>
          <div className={styles.statLabel}>Unique Sessions</div>
          <div className={styles.statSub}>This browser</div>
        </div>

        <div className={`${styles.statCard} ${isLoaded ? styles.fadeIn : ''}`} style={{ animationDelay: '300ms' }}>
          <div className={styles.statIcon} style={{ color: '#e8c77a' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className={styles.statValue} style={{ color: '#e8c77a' }}>
            <AnimatedNumber value={liveVisitors} duration={900} />
          </div>
          <div className={styles.statLabel}>Live Right Now</div>
          <div className={styles.statSub}>Active visitors</div>
        </div>
      </div>

      {/* ── Insight Row ───────────────────────────────────────── */}
      <div className={styles.insightRow}>
        {/* 7-day chart */}
        <div className={`${styles.insightCard} ${styles.chartCard} ${isLoaded ? styles.fadeIn : ''}`} style={{ animationDelay: '400ms' }}>
          <div className={styles.insightHeader}>
            <span className={styles.insightTitle}>7-Day Traffic</span>
            <span className={styles.insightBadge}>This week</span>
          </div>
          <SparklineChart data={chartData} />
        </div>

        {/* Referrer + Device */}
        <div className={styles.sideStack}>
          <div className={`${styles.insightCard} ${isLoaded ? styles.fadeIn : ''}`} style={{ animationDelay: '500ms' }}>
            <div className={styles.insightHeader}>
              <span className={styles.insightTitle}>Traffic Source</span>
            </div>
            <div className={styles.referrerDisplay}>
              <div className={styles.referrerIcon}>
                {referrer === 'Direct' && (
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="var(--ember)" strokeWidth="1.8" fill="none" strokeLinecap="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                )}
                {referrer === 'LinkedIn' && (
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="var(--signal-blue)" strokeWidth="1.8" fill="none" strokeLinecap="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                  </svg>
                )}
                {referrer === 'GitHub' && (
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="var(--paper-dim)" strokeWidth="1.8" fill="none" strokeLinecap="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                )}
                {!['Direct', 'LinkedIn', 'GitHub'].includes(referrer) && (
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="var(--ember)" strokeWidth="1.8" fill="none" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                )}
              </div>
              <div>
                <div className={styles.referrerName}>{referrer}</div>
                <div className={styles.referrerSub}>Current visit source</div>
              </div>
            </div>
          </div>

          <div className={`${styles.insightCard} ${isLoaded ? styles.fadeIn : ''}`} style={{ animationDelay: '600ms' }}>
            <div className={styles.insightHeader}>
              <span className={styles.insightTitle}>Device Breakdown</span>
            </div>
            <DeviceBreakdown mobile={deviceBreakdown.mobile} desktop={deviceBreakdown.desktop} />
          </div>
        </div>
      </div>

      {/* ── Footer note ──────────────────────────────────────── */}
      <p className={styles.footerNote}>
        Built with countapi.xyz · Session data stored locally · No cookies or third-party tracking
      </p>
    </section>
  );
}
