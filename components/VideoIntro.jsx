'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import CinematicLayer from './CinematicLayer';
import styles from './VideoIntro.module.css';

const VIDEO_SRC = '/media/hero-loop.mp4';

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 12A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z" />
      <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      <path d="M3 9v6h4l5 5V4L7 9H3z" />
    </svg>
  );
}

function UnmuteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3z" />
      <path d="M16.6 12 19 9.6l-1.4-1.4L15.2 10.6 12.8 8.2 11.4 9.6 13.8 12l-2.4 2.4 1.4 1.4 2.4-2.4 2.4 2.4 1.4-1.4z" />
    </svg>
  );
}

const INTRO_TEXT =
  'Hi, I am Nancy Sharma. As a BCA graduate and Data Analyst skilled in end-to-end data pipelines, relational modelling, and visual analytics, I combine full-stack development experience with corporate simulation insights from Tata Group and Quantium. Using Python, SQL, and Power BI, I analyze complex datasets to deliver actionable executive insights. Welcome to my portfolio!';

export default function VideoIntro({ onScrollNext }) {
  const rootRef = useRef(null);
  const fgVideoRef = useRef(null);
  const bgVideoRef = useRef(null);
  const badgeRef = useRef(null);
  const speechRef = useRef(null);
  const isPlayingRef = useRef(true);
  const isMutedRef = useRef(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [badgeVisible, setBadgeVisible] = useState(true);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // ---- warm up voices ----------------------------------------------------
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // ---- GSAP entrance sequence -------------------------------------------
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(rootRef.current, { opacity: 1, duration: 1.1 }, 0)
        .to(
          `.${styles.nameLine} span`,
          { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out' },
          0.15
        )
        .to(`.${styles.eyebrow}`, { opacity: 1, duration: 0.8 }, 0.1)
        .to(`.${styles.subtitle}`, { opacity: 1, duration: 0.9 }, 0.7)
        .to(`.${styles.controls}`, { opacity: 1, duration: 0.8 }, 0.9)
        .to(`.${styles.scrollIndicator}`, { opacity: 1, duration: 0.8 }, 1.0)
        .to(`.${styles.soundBadge}`, { opacity: 1, duration: 0.6 }, 1.0);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // ---- auto-hide sound badge ---------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => setBadgeVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // ---- cancel speech on unmount ------------------------------------------
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  // ---- keep fg/bg video in sync ------------------------------------------
  function syncVideos() {
    const fg = fgVideoRef.current;
    const bg = bgVideoRef.current;
    if (fg && bg) {
      bg.currentTime = fg.currentTime;
    }
  }

  // ---- speak the intro text using Speech Synthesis -----------------------
  function speakIntro() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(INTRO_TEXT);
    
    // Attempt to find a soft female voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      return name.includes('female') || 
             name.includes('woman') ||
             name.includes('jenny') || // Microsoft Jenny (Very soft/natural)
             name.includes('aria') ||  // Microsoft Aria (Natural)
             name.includes('zira') || 
             name.includes('samantha') || 
             name.includes('victoria') ||
             name.includes('hazel') ||
             name.includes('susan') ||
             name.includes('karen') ||
             name.includes('tessa');
    });

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    } else {
      // Fallback: pick any English voice but strictly avoid known male voices
      const engVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        return v.lang.startsWith('en') && 
               !name.includes('male') &&
               !name.includes('david') &&
               !name.includes('mark') &&
               !name.includes('daniel') &&
               !name.includes('arthur') &&
               !name.includes('george') &&
               !name.includes('guy');
      });
      if (engVoice) utterance.voice = engVoice;
    }

    // Rate < 1 makes it softer/calmer. Pitch slightly higher for a more feminine tone.
    utterance.rate = 0.9;
    utterance.pitch = 1.15;
    
    utterance.onend = () => {
      // Loop the speech if we are still playing and not muted
      if (isPlayingRef.current && !isMutedRef.current) {
        setTimeout(() => {
          if (isPlayingRef.current && !isMutedRef.current) {
            speakIntro();
          }
        }, 1500); // 1.5 seconds pause between loops
      }
    };
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function togglePlay() {
    const fg = fgVideoRef.current;
    const bg = bgVideoRef.current;
    if (!fg) return;
    if (isPlaying) {
      fg.pause();
      bg?.pause();
      // Pause speech when video is paused
      window.speechSynthesis?.cancel();
    } else {
      fg.play();
      bg?.play();
      // Resume speech if unmuted
      if (!isMuted) {
        speakIntro();
      }
    }
    setIsPlaying(!isPlaying);
  }

  function toggleMute() {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setBadgeVisible(false);

    if (!newMuted) {
      if (isPlayingRef.current) {
        speakIntro();
      }
    } else {
      // User muted → cancel any ongoing speech
      window.speechSynthesis?.cancel();
    }
  }

  return (
    <section ref={rootRef} className={styles.hero} style={{ opacity: 0 }}>
      <div className={styles.bgVideoWrap}>
        <video
          ref={bgVideoRef}
          className={styles.bgVideo}
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
      </div>

      <div className={styles.fgVideoWrap}>
        <video
          ref={fgVideoRef}
          className={styles.fgVideo}
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onTimeUpdate={syncVideos}
        />
      </div>

      <CinematicLayer className={styles.particleLayer} />

      <div className={styles.gradientBottom} />
      <div className={styles.vignette} />
      <div className={styles.grain} />

      <button
        ref={badgeRef}
        type="button"
        className={`${styles.soundBadge} ${badgeVisible ? '' : styles.hidden}`}
        onClick={toggleMute}
      >
        <span className={styles.soundPulse} />
        <span>Tap for sound</span>
      </button>

      <div className={styles.content}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          Data Analyst
        </p>

        <h1 className={styles.nameStack}>
          <span className={styles.nameLine}>
            <span>Nancy</span>
          </span>
          <span className={`${styles.nameLine} ${styles.italic}`}>
            <span>Sharma</span>
          </span>
        </h1>

        <p className={styles.subtitle}>
          <strong>Transforming complex datasets into executive insights</strong> — a BCA
          graduate & Data Analyst skilled in Python, SQL, Power BI, end-to-end data pipelines,
          and relational modelling.
        </p>
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.glassBtn} onClick={togglePlay} aria-label={isPlaying ? 'Pause video' : 'Play video'}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" className={styles.glassBtn} onClick={toggleMute} aria-label={isMuted ? 'Unmute video' : 'Mute video'}>
          {isMuted ? <MuteIcon /> : <UnmuteIcon />}
        </button>
      </div>

      <button type="button" className={styles.scrollIndicator} onClick={onScrollNext}>
        <span className={styles.scrollLabel}>Scroll</span>
        <span className={styles.scrollLine} />
      </button>
    </section>
  );
}
