# Nancy Sharma — Cinematic Portfolio Hero

A Next.js (App Router) interactive portfolio built around a talking-head
video hero, a Three.js ambient bokeh layer, and GSAP-driven cinematic
entrance/scroll animations — followed by an interactive resume generated
from `resume.pdf`.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The first build needs internet access once, to
download the Google Fonts (Fraunces, Inter, JetBrains Mono) used by
`next/font/google`.

## Structure

```
app/
  layout.js         → loads fonts, wraps the app
  globals.css        → design tokens (color/type/motion variables)
  page.js             → composes VideoIntro + ResumeSection
components/
  VideoIntro.jsx              → sticky fullscreen video hero, controls, GSAP intro
  VideoIntro.module.css
  CinematicLayer.jsx          → Three.js additive-blended bokeh particle field
  ResumeSection.jsx           → interactive resume (about, skills, projects,
                                 education, certifications, interests, contact)
  ResumeSection.module.css
public/media/hero-loop.mp4    → the uploaded talking-head video (used as both
                                 the sharp foreground layer and the blurred
                                 ambient background layer)
```

## Design system — "Canvas & Signal"

- **Color**: near-black void (`#0a0806`) with a warm amber/ember accent
  (`#ff8a4a`) for "practical lighting" moments, and a cool signal-blue
  (`#6fa8d8`) used sparingly for data/technical cues.
- **Type**: Fraunces (display serif, humanist — nods to the portraiture
  side of the resume) + Inter (body) + JetBrains Mono (labels, KPIs, dates —
  nods to the data-analytics side).
- **Signature element**: the resume section borrows a "case file / dataset"
  vocabulary (`DS.01`, `DS.02`…) for the three real projects, since they are
  genuinely a small numbered catalogue — tying the data-analyst identity to
  the visual language, without resorting to generic numbered markers
  everywhere.

## Notes on the video

- The same source video is used twice: once sharp/foreground (with
  play/pause + mute/unmute controls) and once heavily blurred as an ambient
  background layer, kept in time-sync via `onTimeUpdate`.
- Autoplay starts muted (required by all browsers); a glassmorphism
  "Tap for sound" badge invites the visitor to unmute, and auto-hides after
  5 seconds or on first interaction.

## Customizing

- Swap the video: replace `public/media/hero-loop.mp4`.
- Resume content lives as plain data arrays at the top of
  `components/ResumeSection.jsx` (`SKILL_GROUPS`, `PROJECTS`, `EDUCATION`,
  `CERTIFICATIONS`) — edit those to update copy without touching markup.
- Colors/fonts/spacing are all CSS custom properties in `app/globals.css`.
