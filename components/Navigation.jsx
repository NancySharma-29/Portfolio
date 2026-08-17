'use client';

import { useState, useEffect } from 'react';
import ResumeModal from './ResumeModal';
import styles from './Navigation.module.css';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  // Handle scroll for blur effect and background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Work', href: '#projects' },
    { label: 'Certification', href: '#certifications' },
    { label: 'Artwork', href: '#artwork' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleScrollTo = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        // Adjust for fixed header offset
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          {/* Logo / Brand */}
          <div className={styles.logo}>
            <a href="#" onClick={(e) => handleScrollTo(e, '#resume')}>
              Nancy Sharma
            </a>
          </div>

          {/* Desktop Nav */}
          <nav className={`${styles.desktopNav} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
            <ul className={styles.navList}>
              {links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} onClick={(e) => handleScrollTo(e, link.href)} className={styles.navLink}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side: Search + Avatar + Mobile Toggle */}
          <div className={styles.rightActions}>
            
            <button className={styles.searchButton} onClick={() => setIsSearchOpen(true)} aria-label="Search">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            <button 
              onClick={() => setIsResumeOpen(true)} 
              className={styles.resumeBtn} 
              aria-label="View and Download Resume"
            >
              <span>Resume</span>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>

            {/* Hamburger Menu */}
            <button className={styles.hamburger} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span className={`${styles.bar} ${mobileMenuOpen ? styles.barOpen1 : ''}`}></span>
              <span className={`${styles.bar} ${mobileMenuOpen ? styles.barOpen2 : ''}`}></span>
              <span className={`${styles.bar} ${mobileMenuOpen ? styles.barOpen3 : ''}`}></span>
            </button>
          </div>
        </div>
        
        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)}></div>
        )}

        {/* Glassmorphism Search Modal */}
        {isSearchOpen && (
          <div className={styles.searchOverlay} onClick={() => setIsSearchOpen(false)}>
            <div className={styles.searchModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.searchIcon}>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="Search projects, skills, or experience..." 
                autoFocus
              />
              <button className={styles.closeSearch} onClick={() => setIsSearchOpen(false)}>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Interactive Resume Modal Viewer */}
      <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
    </>
  );
}
