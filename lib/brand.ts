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
  // Act I — hero subline (single tight line, keep "weekly newsletter")
  sub: "A weekly newsletter for professional service businesses — from idea to launched, every Friday.",
  // Act II — the why: weight contrast; line 1 small/setup, line 2 large/payoff
  whyLines: [
    "Your business has problems AI can solve today.",
    "We show you how — every Friday.",
  ],
  // Act III — the promise steps + author intro (replaces the echo heading)
  promiseKicker: "From idea to…",
  steps: ["Spec", "Prompts", "Build", "Tested", "Launched"],
  author: {
    initials: "TW",
    name: "Tom Wild",
    credential: "From someone who's launched 100+ products across fintech, insurance, accounting, healthcare, trades and marketing.",
  },
  houseLine: "We don't just talk about AI, we build with it together.",
  // Act IV — what you'll build: cards with industry, proof points, mode
  goodsKicker: "What you'll build",
  goods: [
    {
      industry: "Legal",
      title: "After-hours enquiry bot",
      build: "Captures new client instructions outside office hours over voice and web",
      verb: "ANSWERED",
      solves: "Missing instructions — and new business — every evening and weekend",
      mode: "Internal tool",
      proofPoints: [
        { value: "35%", label: "of legal enquiries arrive out of hours" },
        { value: "8hrs", label: "saved weekly on call handling" },
      ],
    },
    {
      industry: "Accounting",
      title: "Automated invoice chaser",
      build: "Sends personalised chase sequences for unpaid invoices — escalating tone, no manual input",
      verb: "CHASED",
      solves: "Partners spending hours chasing what the business is already owed",
      mode: "Internal tool → license to clients",
      proofPoints: [
        { value: "40%", label: "fewer overdue invoices" },
        { value: "£12k+", label: "recovered in a single firm, month one" },
      ],
    },
    {
      industry: "Recruitment",
      title: "AI video screening",
      build: "Video-interviews candidates guided by their CV, scores responses, flags top picks",
      verb: "SCREENED",
      solves: "First-round calls eating the entire week before shortlisting even begins",
      mode: "Internal tool → license it",
      proofPoints: [
        { value: "5×", label: "more candidates screened" },
        { value: "10hrs+", label: "saved per recruiter, per week" },
      ],
    },
  ],
  goodsTakeaway:
    "Built with AI, shown working start to finish — with the product thinking, UX and compliance that make it genuinely usable in your business.",
  goodsCred: "From the studio that ships its own products — RiskPod, PulseIQ and TapReview.",
  // Act V — finale
  finaleHeading: "Subscribe free.",
  finaleSub: "Sent weekly · delivered by Substack",
  successLine: "Done. See you Friday.",
  footerFrom: "From Tom Wild — the studio behind RiskPod, PulseIQ and TapReview.",
  whisperLink: { label: "Hello Crossman", href: "https://hellocrossman.com" },
} as const;

export const SITE_URL = "https://donefriday.com";
