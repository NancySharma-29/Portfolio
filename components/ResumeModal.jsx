'use client';

import { useEffect } from 'react';
import styles from './ResumeModal.module.css';

export default function ResumeModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll when modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} aria-modal="true" role="dialog">
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.pdfIcon}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </span>
            <h3 className={styles.modalTitle}>Nancy_Sharma_Resume.pdf</h3>
          </div>

          <div className={styles.actions}>
            {/* View full PDF in new tab */}
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionBtn}
              title="Open full PDF in a new tab"
            >
              <span>Open Tab</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>

            {/* Direct Download Button */}
            <a
              href="/resume.pdf"
              download="Nancy_Sharma_Resume.pdf"
              className={`${styles.actionBtn} ${styles.downloadBtn}`}
              title="Download PDF"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download</span>
            </a>

            {/* Close Button */}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.2" fill="none">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className={styles.viewerBody}>
          <object
            data="/resume.pdf#view=FitH&toolbar=1"
            type="application/pdf"
            className={styles.pdfObject}
          >
            <div className={styles.mobileFallback}>
              <p>Your browser doesn&apos;t support inline PDF previews on mobile.</p>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.actionBtn} ${styles.downloadBtn}`}
              >
                View Full Resume (PDF)
              </a>
              <a
                href="/resume.pdf"
                download="Nancy_Sharma_Resume.pdf"
                className={styles.actionBtn}
              >
                Download Resume PDF
              </a>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
}
