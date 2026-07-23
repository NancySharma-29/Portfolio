'use client';

import { useRef } from 'react';
import VideoIntro from '../components/VideoIntro';
import ResumeSection from '../components/ResumeSection';
import Navigation from '../components/Navigation';

export default function Home() {
  const resumeRef = useRef(null);

  function scrollToResume() {
    resumeRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <main>
      <Navigation />
      <VideoIntro onScrollNext={scrollToResume} />
      <div ref={resumeRef}>
        <ResumeSection />
      </div>
    </main>
  );
}
