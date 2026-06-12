// Done Friday brand constants.
// Source of truth: docs/brand-playbook/donefriday-brand.md (hellocrossman-2026).

export const COLORS = {
  brick: "#BD4332", // Stamp Brick — the stamp, rare punctuation. Never a background.
  brickPressed: "#9A3324", // Brick Pressed — hover/pressed, dense ink
  ink: "#1B1815", // Near-Black — all text
  paper: "#F6F1E8", // Warm Off-White — backgrounds
  line: "#E3DCCF", // Paper Edge — rules, borders
  sage: "#7E8C6D", // Soft Sage — links, secondary UI
  sageWash: "#ECEFE5", // Sage Wash — callout backgrounds
} as const;

export const COPY = {
  masthead: "Done Friday",
  domain: "donefriday.com",
  title: "Start Sunday. Done Friday.",
  strap: "Start Sunday. Done Friday.",
  sub: "A weekly newsletter for professional service businesses looking to build with AI. Every week we take you step by step from idea to reality, so you can launch tools and products for your own business.",
  // Act II — the why: the tension, then the answer the stamp delivers
  whyLines: [
    "AI is making it easy to build anything you can think of.",
    "We show you how to build things easily to solve your business bottlenecks.",
  ],
  // Act III — the promise
  promiseKicker: "From idea to…",
  promiseHeading: "Started Sunday. Done Friday.",
  steps: ["Spec", "Prompts", "Build", "Tested", "Launched"],
  houseLine: "We don't just talk about AI, we build with it together.",
  // Act IIIb — the goods: what a subscription actually gets you, by example
  goodsKicker: "Every week, one build, end to end",
  goods: [
    // internal tool for the practice
    { build: "An enquiry bot that answers a law firm's after-hours calls", verb: "ANSWERED" },
    // internal tool for the practice
    { build: "An invoice chaser that clears an accountancy firm's debtor list", verb: "CHASED" },
    // internal tool for the practice
    { build: "A screening tool that video-interviews a recruiter's candidates, guided by their CV", verb: "SCREENED" },
  ],
  goodsTakeaway:
    "Built with AI, shown working start to finish — with the product thinking, UX and compliance that make it genuinely usable in your business.",
  goodsCred: "From the studio that ships its own products — RiskPod, PulseIQ and TapReview.",
  // Act IV — finale
  finaleHeading: "Subscribe now for free.",
  finaleSub: "Sent weekly · delivered by Substack",
  successLine: "Done. See you Friday.",
  footerFrom: "From Tom Wild — the studio behind RiskPod, PulseIQ and TapReview.",
  whisperLink: { label: "Hello Crossman", href: "https://hellocrossman.com" },
} as const;

export const SITE_URL = "https://donefriday.com";
