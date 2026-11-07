/**
 * Every word on the site lives here.
 *
 * Rules for anything written in this file:
 *  1. Every fact has ONE home. If a number or a story beat is told in one section, no other section retells it.
 *     (The hero cards are a deliberate index of the work further down, not a second telling.)
 *  2. Text and visual never say the same thing. If the text tells it, the visual shows something new, or there is no visual.
 *  3. First person, plain words, no em dashes, no slogans, no "Not X. Y." lines, no invented details.
 *  4. Facts come from Mayukh's interview (Claude/intake/documents/story-interview_RAW.md) and, for numbers, his resume.
 */

export type Project = {
  slug: string;
  name: string;
  meta: string;
  /** one line: what it is, or what makes it hard */
  headline: string;
  /** one or two sentences on the card */
  summary: string;
  /** only what the card does not already say; shown in the full-screen view */
  detail: string[];
  receipt: { value: string; label: string };
  stack: string;
  links: { label: string; href: string }[];
  visual: "pipeline" | "salon" | "building" | "voice";
};

export const site = {
  name: "Mayukh Banerjee",
  first: "MAYUKH",
  last: "BANERJEE",
  monogram: "MB",
  role: "AI/ML engineer",
  city: "Bangalore",
  timezone: "Asia/Kolkata",
  tzLabel: "IST",
  email: "mayukhbanerjee011@gmail.com",
  /** Shown in the contact section only, at Mayukh's request (2026-11-07). */
  phone: "+91 96208 68983",
  phoneHref: "tel:+919620868983",
  links: {
    linkedin: "https://www.linkedin.com/in/mayukh-banerjee",
    github: "https://github.com/MayukhBanerjee",
    resume: "/resume.pdf",
  },
  description:
    "AI/ML engineer from Bangalore. I build AI systems end to end, mostly the parts that have to keep working when something goes wrong.",
  classOf: "VIT, class of 2027",
};

/** Originals live in /photos; `npm run photos` writes these files. Missing files fall back gracefully. */
export const images = {
  /** B&W suit portrait, background kept. */
  hero: "/images/hero-portrait.webp",
  /** The smiling colour photo that comes down on scroll. */
  hello: "/images/hello-portrait.webp",
  football: "/images/football.jpg",
  diary: "/images/diary.jpg",
};

export type HeroCard = {
  kicker: string;
  title: string;
  metric: string;
  metricLabel: string;
  line: string;
  /** a small trend line for the detail card, 0–1 values, left to right */
  spark: number[];
};

export const hero = {
  introHello: "Hi, I'm",
  kicker: "AI/ML engineer",
  cueRing: "Scroll down · Scroll down · ",
  cueLabel: "Scroll down",
  lines: ["I build AI systems", "that keep working", "when things go wrong."],
  /** who and where, in facts. The results are in the cards below. */
  descriptor:
    "From Bangalore, in my final year of B.Tech at VIT, and an AI engineer at Easehawk Technologies.",
  ctaWork: "See my work",
  ctaAbout: "How it started",
  available: "Open to full-time AI/ML roles",
  pickHint: "pick a card",
  cards: [
    {
      kicker: "Production AI",
      title: "Moxsend",
      metric: "90%+",
      metricLabel: "lower LLM costs",
      line: "The AI behind a live cold email platform.",
      spark: [0.95, 0.9, 0.82, 0.6, 0.42, 0.3, 0.18, 0.12, 0.08],
    },
    {
      kicker: "Research",
      title: "Evoke",
      metric: "2.0%",
      metricLabel: "made-up answers, down from 15.3%",
      line: "A published paper on a model of how one person speaks.",
      spark: [0.9, 0.88, 0.7, 0.55, 0.35, 0.22, 0.16, 0.14, 0.13],
    },
    {
      kicker: "Hackathon",
      title: "EcoLoop",
      metric: "33.8%",
      metricLabel: "less electricity, in simulation",
      line: "Agents that run a building's climate. Built for Honeywell.",
      spark: [0.8, 0.82, 0.7, 0.66, 0.55, 0.5, 0.42, 0.4, 0.36],
    },
    {
      kicker: "Football",
      title: "Karnataka U-17",
      metric: "Gold",
      metricLabel: "national champions",
      line: "I captained the team.",
      spark: [0.2, 0.3, 0.28, 0.45, 0.5, 0.62, 0.7, 0.85, 1],
    },
  ] as HeroCard[],
};

export const statement = {
  label: "problems",
  lines: ["I keep noticing problems", "that nobody has really", "said out loud."],
  sub: "A few I couldn't stop thinking about:",
  /** Each one starts as a quiet note, gets "said out loud", then shows what it became. */
  notes: [
    {
      text: "Sunday at the salon. It's packed, so you leave, and the owner never knew you came.",
      became: "Scheduler AI",
      href: "#work-scheduler-ai",
    },
    {
      text: "The AC runs just as hard in an empty room as in a full one.",
      became: "EcoLoop",
      href: "#work-ecoloop",
    },
    {
      text: "Most cold emails read like they were written for nobody in particular.",
      became: "Moxsend",
      href: "#work-moxsend",
    },
    {
      text: "You can't pick up the phone and talk to someone you've lost.",
      became: "Evoke",
      href: "#work-evoke",
    },
    {
      text: "Knowing your own rights shouldn't take a law degree.",
      became: "LeBy",
      href: "https://github.com/MayukhBanerjee/LeBy",
    },
  ] as { text: string; became: string; href: string }[],
  aside:
    "I'll admit it sometimes means I end up solving something that wasn't in the requirements doc. I've made my peace with that.",
};

export type StoryChapter = {
  id: string;
  when: string;
  title: string;
  /** the story, plainly. Facts that a module shows are NOT repeated here. */
  lead: string;
  /** optional: one line in my own voice that adds the meaning, never a restatement */
  note?: string;
  module: "scoreboard" | "calculator" | "counter" | "products";
};

export const origin = {
  label: "my story",
  title: "How I got here",
  chapters: [
    {
      id: "pitch",
      when: "School years",
      title: "The pitch",
      lead: "Football was the first thing I took really seriously. It taught me teamwork, how to deal with hardship, and how to lose and still come back for the next game.",
      module: "scoreboard",
    },
    {
      id: "calculator",
      when: "Class 10",
      title: "A calculator",
      lead: "It started in 10th grade with the calculator program everyone writes in school. Mine was nothing special, but I saw how big computing is, and I understood early why computers were built in the first place. I've wanted to build with them ever since.",
      module: "calculator",
    },
    {
      id: "backup",
      when: "College, E-Cell",
      title: "The backup",
      lead: "At E-Cell I handled the technical side of our events. For one of them I'd worked out how it should run, and the team couldn't get it built. I'd made a rough version myself, just to show them what I meant. On the day of the event, that's what we ran.",
      note: "That's when I stopped thinking of tech as something I was studying, and started building my life around it.",
      module: "counter",
    },
    {
      id: "dayone",
      when: "May 2026",
      title: "Day one",
      lead: "I joined Easehawk Technologies with no industry experience. My projects were the closest thing I had. Now I own the AI on their live products.",
      module: "products",
    },
  ] as StoryChapter[],
  scoreboard: [
    { what: "School team", score: "6 yrs", note: "captain for the last 2" },
    { what: "Clubs", score: "3", note: "picked me up along the way" },
    { what: "Karnataka U-15", score: "2nd", note: "All India nationals" },
    { what: "Karnataka U-17", score: "1st", note: "All India nationals, as captain", accent: true },
  ] as { what: string; score: string; note: string; accent?: boolean }[],
  calculatorCaption: "try it. the keyboard works too",
  counter: { value: 200, label: "people used it, live" },
  products: {
    label: "Live products I own the AI on",
    items: [
      ["Moxsend", "cold email", "#work-moxsend"],
      ["MoxReply", "inbox automation", ""],
      ["MoxCRM", "lead management", ""],
      ["MoxCampus", "EdTech", ""],
      ["EaseHawk Avatar", "chatbot", ""],
    ] as [string, string, string][],
  },
};

export const method = {
  label: "how I work",
  headline: ["I research before I build,", "so I know where it breaks."],
  body: "Say I'm choosing an LLM API. Before I write any integration code I check what it costs, how fast it responds, and how it does on my own test cases. That's slower at the start, but when something breaks later I usually already know where and why.",
  ladderLabel: "Learned from the bottom up",
  ladder: [
    "Regression & classification",
    "Neural networks",
    "Transformers",
    "Embeddings & vector DBs",
    "Next-word prediction",
    "Small language models",
    "Memory & caching",
    "System architecture",
  ],
  lm: {
    title: "A small language model",
    intro:
      "Built from scratch and trained on the words on this page. Pick a word and watch it guess what comes next.",
    caption: "trigram model · trained on this page · no API",
    seeds: ["I", "Football", "Most", "The", "A", "Now"],
  },
};

export const projects: Project[] = [
  {
    slug: "moxsend",
    name: "MOXSEND",
    meta: "Easehawk Technologies · since May 2026",
    headline: "A cold email platform up against Lemlist, HubSpot and Salesforce.",
    summary:
      "I own the AI: a personalised email for every lead, tracking of replies and engagement, and an inbox that reads the replies and flags the leads worth following up.",
    detail: [
      "Campaigns run from ten thousand to a hundred thousand leads, so I built it to expect failures: batch jobs, careful use of every model call, and a cache for repeated data.",
      "Grouping leads into cohorts is what brought the LLM bill down. One template per cohort, with each lead's details merged in, instead of a model call for every lead.",
    ],
    receipt: { value: "90%+", label: "lower LLM costs" },
    stack: "Python, FastAPI, LangChain, Qdrant",
    links: [],
    visual: "pipeline",
  },
  {
    slug: "scheduler-ai",
    name: "SCHEDULER AI",
    meta: "VIT, 2026",
    headline: "A receptionist for small businesses, and a guide for their customers.",
    summary:
      "A chat-first booking app for both sides. Customers get places that fit what they like, with the free slots at each. Owners get a hands-free receptionist that asks them to accept a booking, then asks when they'll be free.",
    detail: [
      "The model only does two jobs: understanding what the person wants and writing the reply. Searching, ranking and checking that a slot is free all run as plain code, so it can't book a time that doesn't exist.",
    ],
    receipt: { value: "0", label: "hallucinated bookings" },
    stack: "LangGraph, FastAPI, Next.js, MongoDB",
    links: [{ label: "code on github", href: "https://github.com/MayukhBanerjee/Scheduler-AI" }],
    visual: "salon",
  },
  {
    slug: "ecoloop",
    name: "ECOLOOP",
    meta: "Honeywell hackathon",
    headline: "Agents that run a building's climate for the people inside it.",
    summary:
      "Most buildings follow a fixed schedule. EcoLoop uses agents and MCP tools to see who is actually in each zone, then adjusts temperature, humidity, filtration and CO₂ for them.",
    detail: [
      "Any extra sensor a building has can be plugged straight in. The agent only suggests changes: a separate safety layer checks every value before it reaches the equipment.",
    ],
    receipt: { value: "33.8%", label: "less electricity, in simulation" },
    stack: "Python, MCP, Groq, EnergyPlus, Streamlit",
    links: [{ label: "code on github", href: "https://github.com/MayukhBanerjee/EcoLoop" }],
    visual: "building",
  },
  {
    slug: "evoke",
    name: "EVOKE",
    meta: "Published research",
    headline: "A model of how one person speaks.",
    summary:
      "Evoke learns the words someone uses and how they say things, so you can talk to a person you miss. I published a research paper on it.",
    detail: [
      "The hard part was stopping it from inventing opinions the person never had. Consent and data expiry are built into the infrastructure itself, not left as a policy.",
    ],
    receipt: { value: "15.3% → 2.0%", label: "made-up answers" },
    stack: "Schema-conditioned RAG, AWS serverless, Bedrock, LangChain",
    links: [{ label: "code on github", href: "https://github.com/MayukhBanerjee/Evoke" }],
    visual: "voice",
  },
];

export const toolkit = {
  left: {
    label: "What I build with",
    items: [
      ["Python", "shipped"],
      ["React, Next.js", "shipped"],
      ["LLM APIs", "shipped"],
      ["AWS", "shipped"],
      ["Data pipelines", "shipped"],
      ["RAG pipelines", "built by hand"],
      ["Agent systems", "built by hand"],
      ["FastAPI, Node.js", "used"],
    ] as [string, string][],
  },
  right: {
    strongLabel: "Where I'm strongest",
    strong:
      "Building a whole AI pipeline myself, without a framework to lean on. When you write every piece, you know every way it can break.",
    learnLabel: "What I'm learning now",
    learn:
      "Production backend and system design. If the data going in and out of an AI pipeline isn't handled well, it doesn't matter how good the model is. It falls over in production.",
  },
};

export const certificates = {
  label: "Certificates",
  items: [
    { name: "IBM DevOps", issuer: "IBM", href: "https://courses.vit.skillsnetwork.site/certificates/db3a3a534aa4444b8424c3609324e516" },
    { name: "AWS Cloud Architect", issuer: "AWS", href: "https://www.credly.com/badges/a1347bf7-61f1-446c-96b6-e003890ecf61/public_url" },
    { name: "Python Developer Course", issuer: "Udemy", href: "https://www.udemy.com/certificate/UC-939df30c-b65b-4f80-bc7b-c89839e0b8ff/" },
    { name: "Machine Learning A-Z", issuer: "Udemy", href: "https://www.udemy.com/certificate/UC-747394f4-0307-495b-8331-2e6a35df23e2/" },
  ] as { name: string; issuer: string; href: string }[],
};

export const pitch = {
  label: "outside work",
  diaryIntro:
    "Honestly, I don't always know how I juggle college, work and everything else. What I do have is a diary. Everything I need to do goes in it with a deadline, whatever kind of day I'm having, and it gets done before the deadline.",
  proud: "I'm proud that I can slowly support myself now. That one means the most to me.",
};

export const close = {
  next: [
    "In the next few years I want to get really good at one thing, AI/ML, and be the person trusted to make the big calls with it, the ones that shape a team or a company. I don't want to only be learning. I want to be leading too.",
    "I'd also like to have built two or three products that people keep paying for, because they actually fix their problem.",
  ],
  headline: "Say hi.",
  body: "I'm looking for a full-time AI/ML role. Remote suits me best, but I'm happy to be on-site. If you've got a problem nobody's put into words yet, I'd like to hear about it.",
};

export const nav = [
  { label: "Work", href: "#work" },
  { label: "Story", href: "#origin" },
  { label: "Skills", href: "#toolkit" },
  { label: "Contact", href: "#contact" },
];

/** Corpus for the in-page language model: the copy that is actually on the page. */
export function corpus(): string {
  const chunks: string[] = [
    site.description,
    hero.lines.join(" "),
    hero.descriptor,
    ...hero.cards.map((c) => c.line),
    statement.lines.join(" "),
    ...statement.notes.map((n) => n.text),
    statement.aside,
    ...origin.chapters.flatMap((c) => [c.lead, c.note ?? ""]),
    method.headline.join(" "),
    method.body,
    ...projects.flatMap((p) => [p.headline, p.summary, ...p.detail]),
    toolkit.right.strong,
    toolkit.right.learn,
    pitch.diaryIntro,
    pitch.proud,
    ...close.next,
    close.body,
  ];
  return chunks.join(" ");
}
