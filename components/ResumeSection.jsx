'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ResumeModal from './ResumeModal';
import styles from './ResumeSection.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SKILL_GROUPS = [
  {
    label: 'Data Analytics & Visualization',
    items: [
      'EDA & Data Cleaning',
      'Data Imputation & Feature Engineering',
      'Relational Data Modelling',
      'Technical KPI Definition',
      'Data Storytelling',
    ],
  },
  {
    label: 'Programming & Databases',
    items: ['Python (Pandas, NumPy)', 'SQL (SQLite)', 'JavaScript', 'HTML / CSS'],
  },
  {
    label: 'BI & Visualization',
    items: ['Power BI (KPI Cards, Bar/Column Charts)', 'Dynamic Dashboards', 'MS Excel'],
  },
  {
    label: 'AI & Developer Tools',
    items: ['Gemini & Claude (GenAI Workflows)', 'VS Code', 'Git / GitHub', 'MS Office'],
  },
  {
    label: 'Soft Skills & Leadership',
    items: ['Technical Presentation', 'Business Ethics', 'Team Collaboration', 'Data Storytelling'],
  },
  {
    label: 'Languages',
    items: ['English', 'Hindi'],
  },
];

const PROJECTS = [
  {
    index: 'DS.01',
    title: 'Healthcare Flow & Readmission Analytics',
    url: 'https://github.com/NancySharma-29/healthcare-flow-analytics',
    meta: 'Independent Project',
    highlights: [
      { label: 'Data Engineering', text: 'Processed and imputed missing values across 25,000+ hospital records using Python (Pandas, NumPy) in VS Code.' },
      { label: 'SQL Querying', text: 'Executed SQL (SQLite) aggregations revealing a 71.11% readmission risk among frequent ER users (vs 46.13% standard).' },
      { label: 'Power BI Dashboard', text: 'Designed an executive dashboard using KPI cards and clustered charts to pinpoint bed turnover bottlenecks and resource usage.' },
    ],
  },
  {
    index: 'DS.02',
    title: 'Data-Driven Career Navigation Platform',
    meta: 'Independent Project',
    highlights: [
      { label: 'Platform Architecture', text: 'Co-developed a career platform using Node.js, Express, and MongoDB, engineering REST APIs to streamline student skill discovery and job readiness.' },
      { label: 'Automated Parser & Test Engine', text: 'Built a PDF resume keyword parser (pdf-parse, Multer) and a score-gated test engine to dynamically unlock projects and AI mentors.' },
    ],
  },
];

const EDUCATION = [
  {
    date: 'July 2023 — July 2026',
    school: "St. Anne's First Grade College",
    detail: 'Bachelor of Computer Applications (BCA) · CGPA: 8.4 · Bengaluru, Karnataka',
  },
  {
    date: 'April 2021 — March 2023',
    school: 'Little Flower House Senior Secondary School',
    detail: '12th Standard (Mathematics and Science) · 63% · Varanasi, Uttar Pradesh',
  },
  {
    date: 'April 2020 — March 2021',
    school: 'St. Albert High School',
    detail: '10th Standard (Mathematics and Computer Science) · 72% · New Bongaigaon, Assam',
  },
];

const CERTIFICATIONS = [
  { 
    title: 'Quantium Data Analytics Simulation (Forage)', 
    subtitle: 'Retail & Store Analytics · Python, Uplift Testing, Customer Segmentation & Commercial Reporting (July 2026)',
    url: 'https://www.theforage.com/completion-certificates/32A6DqtsbF7LbKdcq/NkaC7knWtjSbi6aYv_32A6DqtsbF7LbKdcq_6a36c1d82fb5b3ec744dee8e_1784145538957_completion_certificate.pdf' 
  },
  { 
    title: 'Tata iQ - GenAI Powered Data Analytics Simulation (Forage)', 
    subtitle: 'Predictive AI & Strategy · GenAI Tools, Predictive Risk Modelling & Agentic Collections Framework (July 2026)',
    url: 'https://www.theforage.com/completion-certificates/ifobHAoMjQs9s6bKS/gMTdCXwDdLYoXZ3wG_ifobHAoMjQs9s6bKS_6a36c1d82fb5b3ec744dee8e_1783885749887_completion_certificate.pdf' 
  },
  { 
    title: 'Tata Consultancy Services Data Visualization Simulation (Forage)', 
    subtitle: 'Executive Dashboards · Visual Basic (VBA), Dashboard Development & Data Visualization (July 2026)',
    url: 'https://www.theforage.com/completion-certificates/ifobHAoMjQs9s6bKS/MyXvBcppsW2FkNYCX_ifobHAoMjQs9s6bKS_6a36c1d82fb5b3ec744dee8e_1784218009256_completion_certificate.pdf' 
  },
  { 
    title: 'Foundations of Cybersecurity (Google / Coursera)', 
    subtitle: 'Security Fundamentals & Risk Analysis',
    url: 'https://www.coursera.org/account/accomplishments/records/T9PYUT291B8Q' 
  },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="34" stroke="#ff8a4a" strokeWidth="1.4" opacity="0.6" />
      <circle cx="34" cy="38" r="6" fill="#ff8a4a" opacity="0.85" />
      <circle cx="62" cy="32" r="4" fill="#6fa8d8" opacity="0.8" />
      <circle cx="66" cy="60" r="7" fill="#f6efe4" opacity="0.65" />
      <circle cx="38" cy="66" r="4.5" fill="#c9531f" opacity="0.85" />
      <path d="M50 16 A34 34 0 0 1 50 84" stroke="#f6efe4" strokeWidth="0.6" opacity="0.3" />
    </svg>
  );
}

function useReveal(selector, options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;
    const ctx = gsap.context(() => {
      const targets = ref.current.querySelectorAll(selector);
      gsap.set(targets, { opacity: 0, y: options.y ?? 28 });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: options.stagger ?? 0.08,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 78%',
          once: true,
        },
      });

      const meters = ref.current.querySelectorAll(`.${styles.skillMeterFill}`);
      if (meters.length) {
        gsap.to(meters, {
          width: '100%',
          duration: 1.4,
          ease: 'power2.out',
          stagger: 0.04,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 78%',
            once: true,
          },
        });
      }
    }, ref);
    return () => ctx.revert();
  }, [selector, options.stagger, options.y]);

  return ref;
}

export default function ResumeSection() {
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const aboutRef = useReveal(`.${styles.revealItem}`, { stagger: 0.12 });
  const skillsRef = useReveal(`.${styles.skillGroup}`, { stagger: 0.1 });
  const projectsRef = useReveal(`.${styles.projectRow}`, { stagger: 0.12 });
  const eduRef = useReveal(`.${styles.timelineRow}`, { stagger: 0.1 });
  const certRef = useReveal(`.${styles.certChip}`, { stagger: 0.06 });
  const canvasRef = useReveal(`.${styles.revealItem}`, { stagger: 0.15 });
  const footerRef = useReveal(`.${styles.revealItem}`, { stagger: 0.08 });

  return (
    <div className={styles.wrap} id="resume">
      {/* ABOUT ------------------------------------------------------- */}
      <section className={styles.section} ref={aboutRef} id="about">
        <p className={`${styles.kicker} ${styles.revealItem}`}>
          <span className={styles.kickerBar} />
          Profile
        </p>
        <div className={styles.aboutGrid}>
          <div className={`${styles.profileImageWrapper} ${styles.revealItem}`}>
             <img src="https://github.com/NancySharma-29.png" alt="Nancy Sharma" className={styles.profileImage} />
          </div>
          <div className={styles.aboutContent}>
            <p className={`${styles.aboutText} ${styles.revealItem}`}>
              Recent <strong>Computer Applications (BCA)</strong> graduate and <strong>Data Analyst</strong> skilled in end-to-end data pipelines, relational modelling, and visual analytics. Combines a full-stack development background with practical experience from top-tier simulations (<strong>Tata Group</strong>, <strong>Quantium</strong>) to clean, structure, and transform complex datasets. Proficient in <strong>Python</strong> (Pandas, NumPy), <strong>SQL</strong> (SQLite), and <strong>Power BI</strong>, with a proven track record of analysing <strong>25,000+ operational records</strong> to deliver actionable executive insights.
            </p>
            <div className={`${styles.statList} ${styles.revealItem}`}>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Target role</span>
                <span className={styles.statValue}>Data Analyst</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Based in</span>
                <span className={styles.statValue}>Bangalore, Karnataka, India</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Core tools</span>
                <span className={styles.statValue}>Power BI · SQL · Python</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Graduating</span>
                <span className={styles.statValue}>July 2026</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Email</span>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=nsharma292004@gmail.com" target="_blank" rel="noreferrer" className={styles.statValue} style={{ textDecoration: 'none', color: 'inherit' }}>nsharma292004@gmail.com</a>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>GitHub</span>
                <a href="https://github.com/NancySharma-29" target="_blank" rel="noreferrer" className={styles.statValue} style={{ textDecoration: 'none', color: 'inherit' }}>NancySharma-29</a>
              </div>
              <div className={styles.statRow} style={{ marginTop: '8px' }}>
                <span className={styles.statLabel}>Resume PDF</span>
                <button
                  onClick={() => setIsResumeOpen(true)}
                  style={{
                    background: 'var(--ember, #ff8a4a)',
                    color: '#0b0d12',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>View &amp; Download</span>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS -------------------------------------------------------- */}
      <section className={styles.section} ref={skillsRef} id="skills">
        <p className={styles.kicker}>
          <span className={styles.kickerBar} />
          Technical Skills
        </p>
        <h2 className={styles.sectionTitle}>What I analyze and build with</h2>
        <div className={styles.skillGroups}>
          {SKILL_GROUPS.map((group) => (
            <div className={styles.skillGroup} key={group.label}>
              <p className={styles.skillGroupLabel}>{group.label}</p>
              {group.items.map((item) => (
                <div className={styles.skillRow} key={item}>
                  <div className={styles.skillTopLine}>
                    <span>{item}</span>
                  </div>
                  <div className={styles.skillMeter}>
                    <div className={styles.skillMeterFill} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS -------------------------------------------------------- */}
      <section className={styles.section} ref={projectsRef} id="projects">
        <p className={styles.kicker}>
          <span className={styles.kickerBar} />
          Case Files
        </p>
        <h2 className={styles.sectionTitle}>Projects</h2>
        <div className={styles.projectList}>
          {PROJECTS.map((project) => (
            <div className={styles.projectRow} key={project.index}>
              <span className={styles.projectIndex}>{project.index}</span>
              <div className={styles.projectBody}>
                <h3>
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.projectTitleLink}
                    >
                      <span>{project.title}</span>
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.projectExternalIcon}
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  ) : (
                    project.title
                  )}
                </h3>
                <span className={styles.projectMeta}>{project.meta}</span>
                {project.highlights ? (
                  <ul className={styles.projectHighlights}>
                    {project.highlights.map((h, i) => (
                      <li key={i}>
                        <strong>{h.label}:</strong> {h.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{project.body}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION -------------------------------------------------------- */}
      <section className={styles.section} ref={eduRef}>
        <p className={styles.kicker}>
          <span className={styles.kickerBar} />
          Education
        </p>
        <div className={styles.timeline}>
          {EDUCATION.map((edu) => (
            <div className={styles.timelineRow} key={edu.school}>
              <span className={styles.timelineDate}>{edu.date}</span>
              <div className={styles.timelineBody}>
                <h3>{edu.school}</h3>
                <p>{edu.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CERTIFICATIONS -------------------------------------------------------- */}
      <section className={styles.section} ref={certRef} id="certifications">
        <p className={styles.kicker}>
          <span className={styles.kickerBar} />
          Certifications
        </p>
        <div className={styles.certGrid}>
          {CERTIFICATIONS.map((cert) => (
            <a href={cert.url} target="_blank" rel="noreferrer" className={styles.certChip} key={cert.title} style={{ textDecoration: 'none' }}>
              <span className={styles.certCheck}>
                <CheckIcon />
              </span>
              <div className={styles.certTextGroup}>
                <span className={styles.certTitle}>{cert.title}</span>
                {cert.subtitle && <span className={styles.certSub}>{cert.subtitle}</span>}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* INTERESTS / CANVAS -------------------------------------------------------- */}
      <section className={styles.section} ref={canvasRef} id="artwork">
        <p className={`${styles.kicker} ${styles.revealItem}`}>
          <span className={styles.kickerBar} />
          Beyond the Screen
        </p>
        <div className={styles.canvasBlock}>
          <div className={`${styles.canvasFrame} ${styles.revealItem}`}>
            <PaletteIcon />
          </div>
          <p className={`${styles.canvasText} ${styles.revealItem}`}>
            <span className={styles.canvasQuoteMark}>&ldquo;</span>
            I actively practice fine-art <strong>portraiture</strong>. The
            patience, attention to detail, and creative problem-solving it
            takes to bring a canvas to life directly informs how I approach
            data — <strong>parsing chaos into structured, visual
              narratives.</strong>
          </p>
        </div>
      </section>

      {/* FOOTER / CONTACT -------------------------------------------------------- */}
      <footer className={styles.footer} ref={footerRef} id="contact">
        <h2 className={`${styles.footerTitle} ${styles.revealItem}`}>
          Let&rsquo;s build something worth visualizing.
        </h2>
        <div className={`${styles.footerLinks} ${styles.revealItem}`}>
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=nsharma292004@gmail.com" target="_blank" rel="noreferrer">nsharma292004@gmail.com</a>
          <a href="tel:+919707356190">+91 97073 56190</a>
          <a
            href="https://linkedin.com/in/nancy-sharma-8ab256317"
            target="_blank"
            rel="noreferrer"
          >
            linkedin.com/in/nancy-sharma
          </a>
          <a
            href="https://github.com/NancySharma-29"
            target="_blank"
            rel="noreferrer"
          >
            github.com/NancySharma-29
          </a>
        </div>
        <p className={`${styles.footerMeta} ${styles.revealItem}`}>
          Bangalore, Karnataka, India — © {new Date().getFullYear()} Nancy Sharma
        </p>
      </footer>

      {/* Interactive Resume Modal */}
      <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
    </div>
  );
}
