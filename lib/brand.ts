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
  title: "Done Friday.",
  sub: "One problem in your practice. One working tool. Every Friday.",
  // Act II — the number (stat from the brief; swap to match the lead vertical)
  statBig: "64%",
  statLines: [
    "40% of firms answer the phone.",
    "64% of new clients never hear back.",
  ],
  // Act III — the promise
  promise:
    "Every week, one tool you can build and have working by Friday. Built, shown, shipped.",
  verbs: ["ANSWERED", "CHASED", "SHIPPED", "BOOKED", "FILED"],
  houseLine: "We don't write about AI. We build with it.",
  // Act IV — finale
  finaleHeading: "Stamp your name.",
  finaleSub: "Free. Weekly. Opt-in only — unsubscribe any time.",
  successLine: "Done. See you Friday.",
  footerFrom: "From Tom Wild — the studio behind RiskPod, PulseIQ and TapReview.",
  whisperLink: { label: "Hello Crossman", href: "https://hellocrossman.com" },
} as const;

export const SITE_URL = "https://donefriday.com";
