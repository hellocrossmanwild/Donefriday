# donefriday.com

The marketing landing page for **Done Friday** — a weekly newsletter for owners
of small professional-services firms. One problem in your practice, one working
tool, every Friday.

Built to the creative brief in
`hellocrossman-2026/docs/brand-playbook/donefriday-landing-brief.md`:
*"The whole internet is paper. We stamp it DONE."* A scroll-driven cinematic in
four acts — The Stamp → The Number → The Promise → Stamp Your Name — opening in
a dark studio and resolving to warm paper, ending in a stamp-to-subscribe email
finale. No sound. Single goal: email signup.

## Stack

- **Next.js 15** (App Router) on Vercel
- **Lenis** smooth scroll + **GSAP ScrollTrigger** — one normalised scroll
  progress drives the 3D, the DOM acts and the dark→paper colour grade
  (`components/cinematic/choreography.ts` is the single source of truth)
- **React-Three-Fiber + drei** — procedural hero rubber stamp (no model files),
  Lightformer studio environment (no HDRI download), DOF + grain on desktop
- **Ink/paper shaders** — ink bloom faked as a noisy distance field with a
  wicking edge in a fragment shader (`components/cinematic/InkPaper.tsx`)

## The fallback is the baseline

`app/page.tsx` server-renders a complete static editorial page
(`components/StaticLanding.tsx`) with the signup above the fold. The film
(`components/cinematic/`) lazy-loads after first paint and only for devices
that have WebGL, don't prefer reduced motion, and aren't on data-saver. Search
engines, no-JS readers and reduced-motion readers get the editorial cut.

The subscribe form works without JavaScript (plain form POST + redirect).

## Brand

Everything reads against `donefriday-brand.md`: Stamp Brick `#BD4332` as
punctuation only, Near-Black `#1B1815` → Warm Off-White `#F6F1E8`, Soft Sage
`#7E8C6D` secondary. Schibsted Grotesk display, Newsreader body, Geist Mono
metadata. The 3D rubber face and every 2D stamp share one geometric definition
(`lib/stamp-mark.ts`) so the mark always matches.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run check   # tsc
npm run build
```

## Email capture

`/api/subscribe` forwards to the configured provider — see `.env.example`
(`SUBSTACK_URL` or `BUTTONDOWN_API_KEY`). Opt-in only; honeypot included.
Success state prints DONE across the subscriber's email.

## Analytics

`lib/analytics.ts` emits `act_viewed` (scroll depth per act),
`subscribe_submitted/done/error` to Vercel Analytics when its script is
present; no-ops otherwise.
