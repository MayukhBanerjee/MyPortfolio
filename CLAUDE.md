# CLAUDE.md — Mayukh Banerjee portfolio

Living project guide. **Update this file whenever something about the site changes.**
Last updated: 2026-11-07.

## What this is
Personal portfolio for Mayukh Banerjee (AI/ML engineer, Bangalore). The audience is mainly recruiters hiring for full-time AI/ML roles.
The whole site is one long scroll split into 10 "scenes", framed as a 90-minute football match (he captained Karnataka's U-17 team to a national gold).

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
  layout.tsx            fonts, metadata, JSON-LD, Nav, MatchClock, grain
  page.tsx              scene order
  globals.css           tokens (--black --paper --mute --teal), type primitives, grain
  not-found.tsx         404 ("Possibly a hallucination.")
components/
  Providers.tsx         intro phase, Lenis instance, ScrollTrigger sort/refresh
  sections/             one file per scene (see table below)
  three/                PipelineScene (Moxsend), FormationScene (closing). R3F, client-only
  work/                 TinyLM, PipelineVisual, SalonStory, BuildingSim, VoiceWave, ProjectOverlay
  ui/                   Nav, MatchClock, SectionLabel, MaskLines, LiveTime
  story/                Calculator
data/portfolio.ts       EVERY word on the site + image paths + LM corpus builder
lib/
  gsap.ts               plugin registration + MQ media-query keys
  hooks.ts              reduced motion, near/in viewport, image-exists check
  lm/trigram.ts         the from-scratch trigram language model
public/images/          photos (see README there)
```

## Scenes
Page order (2026-11-07, for the person hiring): Hero → Experience → Work → Skills → Problems → Story → How I work → Outside work → Contact. Work starts about 3.5 screens down.

| # | File | What happens | 3D? |
|---|---|---|---|
| 00+01 | `sections/Hero.tsx` | One stage, three parts. **Loader** (1px line, real-loading counter, shatter, overlay wipes up). **Screen 1** has only the greeting: "Hi, I'm" (serif italic), MAYUKH (Archivo 900, split into letters that rise through masks) and BANERJEE (Archivo 200, wipes in), both fitted to one width in JS, plus the B&W suit portrait in an arch with an offset outline and a **scroll cue** (a turning ring of text around a bobbing arrow, teal-free, clickable). Extras: a thin "scanner" band that inverts the name every ~8s, cursor parallax on the photo and outline, a soft light that follows the cursor on the photo, and letters near the cursor lift. **Scroll** (desktop, pinned `PIN_SCREENS` screens): the photo frame holds a vertical strip of two photos and the strip is pulled DOWN, so the smiling **colour** photo (`hello-portrait.webp`) drops in from the top while the suit leaves through the bottom; the name rises out; the hero builds in on the left (headline, CTAs, pickable proof cards) with the detail card and the "open to roles" badge on the photo. A soft snap (`TL_READY`) lands one flick exactly on the hero, and scrolling back up returns to screen 1. The nav and match clock stay hidden while screen 1 is up (`html[data-intro="1"] .site-chrome`). **Phones:** two normal screens; the smiling photo is lowered into its arch when it scrolls in. The scroll timeline is only built after the entrance finishes (`phase === "done"`), or the two fight over the letters. The detail card's overhang is clamped to the free room (`CARD_OVERHANG`). Never use Tailwind `translate` on GSAP-animated elements. | no |
| 01b | `sections/Experience.tsx` | Black. The record: role, dates, place for Easehawk (AI Engineer, Intern) and E-Cell, then education (B.Tech IT, VIT, GPA 8.56, graduating June 2027). | no |
| 02 | `sections/Statement.tsx` | Paper. The claim sits small in the centre, surrounded by 5 quiet grey notes (the real problems behind the projects). Pinned: each note is "said out loud" centre stage, then settles in black with "→ became X" linking to its project. On mobile it's a list that darkens as you read. | no |
| 03 | `sections/Origin.tsx` | Black. "How I got here": 4 chapters (The pitch / A calculator / The backup / Day one) with a sticky chapter index on desktop. Each chapter is one plain paragraph (plus one line in his voice where it adds meaning) and ONE module that adds something the words don't: the football record table (U-17 1st in teal), a working calculator (`components/story/Calculator.tsx`: tap or type, precedence, decimals, %, backspace, keyboard only while hovered or focused), the 200-people counter (teal), and the list of live products he owns the AI on. | no |
| 04 | `sections/HowIWork.tsx` | Research-first copy, depth ladder, and **TinyLM**: a real trigram model trained on the site's own text, showing live next-word probabilities. | no |
| 05 | `sections/Work.tsx` | Moxsend, Scheduler AI, EcoLoop, Evoke, then an "Also built" row (LeBy). Giant cropped names, one proving visual each, `→` opens a black overlay: headline, receipt, summary, detail, the extra numbers with context, stack, links (code, live demo), and a "how it works" flow. Each project has `headline` / `summary` / `detail` / `flow` / `numbers`; the overlay never repeats the card. | Moxsend pipeline |
| 06 | `sections/Toolkit.tsx` | Op-ed columns with honest labels (shipped / built by hand / used), then "The full list" (every tool from the resume, grouped, for people searching by stack), then certificates. | no (on purpose) |
| 07 | `sections/OffThePitch.tsx` | Paper. How he keeps it together (the diary), then the quiet "proud" line. The diary photo only shows if `public/images/diary.jpg` exists; nothing is made up. | no |
| 08 | `sections/FullTime.tsx` | Vision, "Say hi.", email copy, footer. Behind it, a 4-3-3 formation connects into a network; the last edge is teal. | Formation |

Global: `MatchClock` (scroll → 00'–90', HT at half; top-centre on phones) and the nav with `mix-blend-mode: difference`, which includes a Resume link. The old `[ 30 SEC ]` sheet was removed (2026-11-07): it listed the same four items as the hero cards.

## Hard rules
1. **Copy only lives in `data/portfolio.ts`** (it is the source of truth now; `Claude/08` is older). Never hardcode text in JSX.
   **Every fact has one home.** If a number or story beat is told in one section, no other section retells it (the hero cards are a deliberate index of Work). **Text and visual never say the same thing:** the visual shows something the text leaves out, or there is no visual. Facts come from the interview (`Claude/intake/documents/story-interview_RAW.md`); numbers and links from the resume.
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
8. Never put salary or address on the site. The phone number appears in the contact section only (Mayukh asked for it on 2026-11-07); nowhere else, and not in the JSON-LD.
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
- [x] Resume: `public/Mayukh-Banerjee-Resume.pdf` (copied from `C:\Mayukh Main\Mayukh Banerjee Resume.pdf`), linked from the nav, the hero and contact. Replace the file when the resume changes.
- [ ] Confirm with Easehawk that competitor names and Moxsend details are OK to publish
- [ ] Mayukh to read all copy in `data/portfolio.ts` and mark anything that doesn't sound like him (rewritten 2026-11-07 after he said the English wasn't good and repeated itself)
- [ ] Diary: no photo yet, so that section is text only. Save a photo as `photos/diary.jpg` and run `npm run photos`.
- [ ] Story dates: only May 2026 (Easehawk) and 2025 (E-Cell, from the resume) are known. Football years still missing.
- [ ] Open facts: U-15/U-17 years and tournament name, Evoke paper link, EcoLoop result, E-Cell event name
- [ ] Vercel: `mayukh-sable.vercel.app` returned 404 on 2026-11-07, so the deploy isn't live yet
- [ ] Waiting on Mayukh: Evoke paper venue + link, start date, AI assistant yes/no (+ API key), Easehawk OK to name competitors
- [ ] GitHub hygiene (his side): Evoke has no README; Evoke and Scheduler AI repos have no description; profile has no bio; demo URL `scheduler-ai-haha` reads unserious
- [x] Link preview: `public/og.png` (1200x630), wired in `app/layout.tsx`. Site URL there is `https://mayukh-sable.vercel.app` (the repo's homepage); change `url` if the live address differs.

## Commit format
`feat: section-[XX]-[name] complete` for scenes; conventional commits otherwise.
