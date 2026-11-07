# CLAUDE.md — Mayukh Banerjee portfolio

Living project guide. **Update this file whenever something about the site changes.**
Last updated: 2026-11-07.

## What this is
Personal portfolio for Mayukh Banerjee (AI/ML engineer, Bangalore). The audience is mainly recruiters hiring for full-time AI/ML roles.
The whole site is one long scroll split into 9 "scenes", framed as a 90-minute football match (he captained Karnataka's U-17 team to a national gold).

Planning docs live in `Claude/` (gitignored, local only):
- `07_STORY_BIBLE.md`: facts about him
- `08_NARRATIVE_AND_COPY.md`: approved copy
- `09_VOICE_RULES.md`: how copy must sound
- `10_CREATIVE_DIRECTION.md`: design brief

Read 09 and 10 before changing anything visible.

## Commands
```bash
npm run dev        # local dev (Turbopack)
npm run build      # production build, must pass before every commit
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

## Stack
- Next.js 16 (App Router), React 19, TypeScript strict.
- GSAP 3 + ScrollTrigger (via `@gsap/react` `useGSAP`) for all scroll choreography.
- Lenis for smooth scroll, bridged to the GSAP ticker in `components/Providers.tsx`.
- three.js + React Three Fiber + drei, used **only** in `components/three/*` and lazy-loaded.
- Tailwind v4, **for layout only**. Color, type and motion use CSS tokens in `app/globals.css`.
- Fonts via `next/font/google`: Archivo (variable, `wdth` axis), Instrument Sans, Instrument Serif, JetBrains Mono.

## Map
```
app/
  layout.tsx            fonts, metadata, JSON-LD, Nav, MatchClock, HighlightsSheet, grain
  page.tsx              scene order
  globals.css           tokens (--black --paper --mute --teal), type primitives, grain
  not-found.tsx         404 ("Possibly a hallucination.")
components/
  Providers.tsx         intro phase, Lenis instance, highlights-open state, ScrollTrigger sort/refresh
  sections/             one file per scene (see table below)
  three/                PipelineScene (Moxsend), FormationScene (closing). R3F, client-only
  work/                 TinyLM, PipelineVisual, SalonStory, BuildingSim, VoiceWave, ProjectOverlay
  ui/                   Nav, MatchClock, SectionLabel, MaskLines, LiveTime, HighlightsSheet
data/portfolio.ts       EVERY word on the site + image paths + LM corpus builder
lib/
  gsap.ts               plugin registration + MQ media-query keys
  hooks.ts              reduced motion, near/in viewport, image-exists check
  lm/trigram.ts         the from-scratch trigram language model
public/images/          photos (see README there)
```

## Scenes
| # | File | What happens | 3D? |
|---|---|---|---|
| 00+01 | `sections/Hero.tsx` | One stage, three parts. **Loader** (1px line, real-loading counter, shatter, overlay wipes up). **Screen 1** has only the greeting: "Hi, I'm" (serif italic), MAYUKH (Archivo 900, split into letters that rise through masks) and BANERJEE (Archivo 200, wipes in), both fitted to one width in JS, plus the B&W suit portrait in an arch with an offset outline and a **scroll cue** (a turning ring of text around a bobbing arrow, teal-free, clickable). Extras: a thin "scanner" band that inverts the name every ~8s, cursor parallax on the photo and outline, a soft light that follows the cursor on the photo, and letters near the cursor lift. **Scroll** (desktop, pinned `PIN_SCREENS` screens): the photo frame holds a vertical strip of two photos and the strip is pulled DOWN, so the smiling **colour** photo (`hello-portrait.webp`) drops in from the top while the suit leaves through the bottom; the name rises out; the hero builds in on the left (headline, CTAs, pickable proof cards) with the detail card and the "open to roles" badge on the photo. A soft snap (`TL_READY`) lands one flick exactly on the hero, and scrolling back up returns to screen 1. The nav and match clock stay hidden while screen 1 is up (`html[data-intro="1"] .site-chrome`). **Phones:** two normal screens; the smiling photo is lowered into its arch when it scrolls in. The scroll timeline is only built after the entrance finishes (`phase === "done"`), or the two fight over the letters. The detail card's overhang is clamped to the free room (`CARD_OVERHANG`). Never use Tailwind `translate` on GSAP-animated elements. | no |
| 02 | `sections/Statement.tsx` | Paper. The claim sits small in the centre, surrounded by 5 quiet grey notes (the real problems behind the projects). Pinned: each note is "said out loud" centre stage, then settles in black with "→ became X" linking to its project. On mobile it's a list that darkens as you read. | no |
| 03 | `sections/Origin.tsx` | Black. "How I got here": 4 chapters (The pitch / A calculator / The backup / Day one) with a sticky chapter index on desktop. Each chapter has a title, a line in his voice (serif italic), 2 short paragraphs and one module: football record table (U-17 1st in teal), a working calculator that types 2+2= itself (`components/story/Calculator.tsx`), an event-day log with a live counter to 200 (teal), and a day-one vs now panel. | no |
| 04 | `sections/HowIWork.tsx` | Research-first copy, depth ladder, and **TinyLM**: a real trigram model trained on the site's own text, showing live next-word probabilities. | no |
| 05 | `sections/Work.tsx` | Moxsend → Scheduler AI → EcoLoop → Evoke. Giant cropped names, one proving visual each, `→` opens a black overlay. | Moxsend pipeline |
| 06 | `sections/Toolkit.tsx` | Op-ed columns. Honest labels: shipped / built by hand / used. | no (on purpose) |
| 07 | `sections/OffThePitch.tsx` | Paper. Outside work: the diary (entries struck through on scroll), then the quiet "proud" line. Football moved into the story so it isn't told twice. | no |
| 08 | `sections/FullTime.tsx` | Vision, "Say hi.", email copy, footer. Behind it, a 4-3-3 formation connects into a network; the last edge is teal. | Formation |

Global: `MatchClock` (scroll → 00'–90', HT at half; top-centre on phones), `[ 30 SEC ]` sheet (also the `H` key), nav with `mix-blend-mode: difference`.

## Hard rules
1. **Copy only lives in `data/portfolio.ts`**, and must come from `Claude/08_NARRATIVE_AND_COPY.md`. Never hardcode text in JSX.
2. **Voice:** first person, no em dashes in site copy, no slogans or "Not X. Y." lines, no invented details. Test: would Mayukh say it to a recruiter on a call?
3. **Teal `#00d4b4` = verified fact, max 5 uses, only on black:**
   1. hero "open to roles" badge dot
   2. U-17 "1st" (story scoreboard)
   3. "200" (story event log)
   4. Moxsend 90%+ (overlay)
   5. last formation edge

   Count before adding any.
4. **3D only where it explains something.** No decorative shapes, starfields or orbs.
5. Every scroll animation sits inside `gsap.matchMedia()` with `MQ.motion` (reduced motion gets the static end state).
6. Pinned triggers need `refreshPriority` in page order (statement 2, origin 1), or start positions break.
7. 3D canvases mount only near the viewport (`useNearViewport`) and render only while visible (`frameloop`).
8. Never put salary, phone number or address on the site.
9. Global CSS goes inside `@layer base` (elements) or `@layer components` (classes like `.mono`, `.display`). Unlayered CSS beats Tailwind utilities and silently breaks `text-*`, `leading-*` and so on.

## Photos
Originals go in `photos/` (gitignored). Run `npm run photos` (`scripts/prepare-photos.mjs`, uses sharp) to write optimized files to `public/images/`:
- `hello.jpg` (smiling, daylight, blue shirt, arms crossed) becomes `hello-portrait.webp`, **full colour**, cropped from head to crossed arms. It's the photo that comes down on scroll in the hero. Saved 2026-11-07.
- `hero.jpg` becomes `hero-portrait.webp`: black and white, background kept, cropped to head and torso (crop box in `scripts/prepare-photos.mjs`). The background-removed cutout was dropped because the night shot gave rough hair edges.
- `football.jpg` and `diary.jpg` are optimized if present. Scenes fall back to placeholders when they're missing.

## Status / TODO
- [x] All 9 scenes built, desktop + mobile checked via screenshots, build passing
- [x] Hero portrait in (2026-11-07); hero redesigned to the light editorial layout with pickable cards
- [x] Statement redesigned: problems "said out loud", each linking to what it became
- [ ] `football.jpg`, `diary.jpg` → `photos/`, then `npm run photos`
- [ ] `public/resume.pdf` (linked from nav, contact and the 30 SEC sheet; 404 until added)
- [ ] Confirm with Easehawk that competitor names and Moxsend details are OK to publish
- [ ] Mayukh to sign off copy blocks added in code beyond doc 08: Scheduler/EcoLoop/Evoke "long" paragraphs, inbox paragraph, LM intro
- [ ] Diary entries are placeholders until a photo of the real diary arrives
- [ ] Story dates are vague on purpose (School years / Class 10 / College, E-Cell / May 2026). Get real years before adding any.
- [ ] Open facts: U-15/U-17 years and tournament name, Evoke paper link, EcoLoop result, E-Cell event name
- [ ] GitHub repo + Vercel import; set the real domain in `app/layout.tsx` (`url`)
- [ ] OG image (static render of the hero mask frame)

## Commit format
`feat: section-[XX]-[name] complete` for scenes; conventional commits otherwise.
