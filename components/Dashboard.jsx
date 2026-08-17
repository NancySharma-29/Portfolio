'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './Dashboard.module.css';

// ─── Helpers ───────────────────────────────────────────────────────────────

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
        <AnimatedNumber value={count} duration={800} /> live active visitor{count === 1 ? '' : 's'}
      </span>
    </div>
  );
}

// ─── Device Donut ─────────────────────────────────────────────────────────

function DeviceBreakdown({ mobile, desktop }) {
  const total = mobile + desktop || 1;
  const mobilePercent = Math.round((mobile / total) * 100);
  const desktopPercent = 100 - mobilePercent;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const desktopDash = (desktopPercent / 100) * circ;
  const mobileDash = (mobilePercent / 100) * circ;

  return (
    <div className={styles.donutWrap}>
      <svg width="72" height="72" viewBox="0 0 72 72" className={styles.donutSvg}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(246,239,228,0.07)" strokeWidth="8" />
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

// ─── Total Visitors Hero Banner ────────────────────────────────────────────

function TotalVisitorsBanner({ count, isLoaded, apiError }) {
  return (
    <div className={`${styles.heroBanner} ${isLoaded ? styles.heroVisible : ''}`}>
      <div className={styles.heroOrbit1} />
      <div className={styles.heroOrbit2} />

      <div className={styles.heroContent}>
        <div className={styles.heroIconWrap}>
          <svg viewBox="0 0 24 24" width="36" height="36" stroke="var(--ember)" strokeWidth="1.4" fill="none" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>

        <div className={styles.heroTextBlock}>
          <div className={styles.heroEyebrow}>All-Time · Never Resets</div>
          <div className={styles.heroCount}>
            {isLoaded ? (
              <AnimatedNumber value={count} duration={2500} />
            ) : (
              <span className={styles.heroCountLoading}>—</span>
            )}
          </div>
          <div className={styles.heroLabel}>Total Visitors</div>
        </div>

        <div className={styles.heroDivider} />

        <div className={styles.heroMeta}>
          <div className={styles.heroMetaItem}>
            <span className={styles.heroMetaDot} style={{ background: '#4caf7d' }} />
            <span>100% Server-backed live counter — no localStorage</span>
          </div>
          <div className={styles.heroMetaItem}>
            <span className={styles.heroMetaDot} style={{ background: 'var(--ember)' }} />
            <span>Session-protected — page refreshes do not increment visits</span>
          </div>
          {apiError && (
            <div className={styles.heroMetaItem}>
              <span className={styles.heroMetaDot} style={{ background: '#e8c77a' }} />
              <span>Connecting to analytics server...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────

export default function Dashboard() {
  const [totalVisits, setTotalVisits] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [uniqueSessions, setUniqueSessions] = useState(0);
  const [activeVisitors, setActiveVisitors] = useState(1);
  const [chartData, setChartData] = useState([]);
  const [referrer, setReferrer] = useState('Direct');
  const [deviceBreakdown, setDeviceBreakdown] = useState({ mobile: 0, desktop: 1 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const currentReferrer = parseReferrer();
    const currentDevice = getDeviceType();
    setReferrer(currentReferrer);

    // Session Protection: use sessionStorage to prevent page refreshes from incrementing visit counts
    let sessionId = sessionStorage.getItem('ns_session');
    const isNewSession = !sessionId;

    if (isNewSession) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('ns_session', sessionId);
    }

    // Function to process server response
    const applyServerAnalytics = (data) => {
      if (data) {
        if (typeof data.totalVisits === 'number') setTotalVisits(data.totalVisits);
        if (typeof data.todayVisits === 'number') setTodayVisits(data.todayVisits);
        if (typeof data.uniqueSessions === 'number') setUniqueSessions(data.uniqueSessions);
        if (typeof data.activeVisitors === 'number') setActiveVisitors(data.activeVisitors);
        if (Array.isArray(data.chartData)) setChartData(data.chartData);
        if (data.deviceBreakdown) setDeviceBreakdown(data.deviceBreakdown);
      }
    };

    // Initial server fetch / increment
    const fetchAnalytics = async () => {
      try {
        let res;
        if (isNewSession) {
          // Brand new session -> POST request to increment counts
          res = await fetch('/api/visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              device: currentDevice,
              referrer: currentReferrer,
            }),
          });
        } else {
          // Returning session / page refresh -> GET request without incrementing
          res = await fetch(`/api/visit?sessionId=${encodeURIComponent(sessionId)}`);
        }

        if (!res.ok) throw new Error('API fetch failed');
        const data = await res.json();
        applyServerAnalytics(data);
      } catch (err) {
        setApiError(true);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchAnalytics();

    // Real-time Heartbeat & Stats Polling (every 15s)
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/visit?sessionId=${encodeURIComponent(sessionId)}`);
        if (res.ok) {
          const data = await res.json();
          applyServerAnalytics(data);
        }
      } catch {}
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="dashboard" className={styles.section}>
      {/* Section header */}
      <div className={styles.headerRow}>
        <div className={styles.eyebrow}>Live Analytics</div>
        <h2 className={styles.title}>Portfolio Dashboard</h2>
        <p className={styles.subtitle}>
          100% server-backed visitor metrics — real-time tracking, no cookies.
        </p>
        {apiError && (
          <span className={styles.offlineBadge}>● Connecting to live analytics server</span>
        )}
      </div>

      {/* ── Total Visitors Hero ───────────────────────────────── */}
      <TotalVisitorsBanner
        count={totalVisits}
        isLoaded={isLoaded}
        apiError={apiError}
      />

      {/* Live indicator strip */}
      <div className={styles.liveStrip}>
        <LivePulse count={activeVisitors} />
        <span className={styles.stripDivider} />
        <span className={styles.stripNote}>Server-backed live active session tracking</span>
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
          <div className={styles.statSub}>All time · persistent server total</div>
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
          <div className={styles.statSub}>Server daily log</div>
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
          <div className={styles.statSub}>Distinct session IDs</div>
        </div>

        <div className={`${styles.statCard} ${isLoaded ? styles.fadeIn : ''}`} style={{ animationDelay: '300ms' }}>
          <div className={styles.statIcon} style={{ color: '#e8c77a' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className={styles.statValue} style={{ color: '#e8c77a' }}>
            <AnimatedNumber value={activeVisitors} duration={900} />
          </div>
          <div className={styles.statLabel}>Live Right Now</div>
          <div className={styles.statSub}>Active sessions</div>
        </div>
      </div>

      {/* ── Insight Row ───────────────────────────────────────── */}
      <div className={styles.insightRow}>
        {/* 7-day chart */}
        <div className={`${styles.insightCard} ${styles.chartCard} ${isLoaded ? styles.fadeIn : ''}`} style={{ animationDelay: '400ms' }}>
          <div className={styles.insightHeader}>
            <span className={styles.insightTitle}>7-Day Traffic</span>
            <span className={styles.insightBadge}>Server analytics</span>
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
        100% real-time server analytics · No localStorage · Session-protected increment
      </p>
    </section>
  );
}
