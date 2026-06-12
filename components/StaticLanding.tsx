import StampMark from "@/components/StampMark";
import SubscribeForm from "@/components/SubscribeForm";
import { COLORS, COPY } from "@/lib/brand";
import styles from "./StaticLanding.module.css";

function dateline() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  })
    .format(new Date())
    .toUpperCase();
}

export default function StaticLanding({ initialDone = false }: { initialDone?: boolean }) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.masthead}>
          <span className={styles.mastheadName}>{COPY.masthead}</span>
          <div className={styles.mastheadRight}>
            <span className={`mono ${styles.dateline}`}>{dateline()}</span>
            <a className="skip-to-subscribe" href="#subscribe">
              Subscribe
            </a>
          </div>
        </header>

        <main>
          {/* Act I — hero */}
          <section className={styles.hero}>
            <div className={styles.heroStamp}>
              <StampMark word="DONE" height={72} title="DONE — the Done Friday stamp" />
            </div>
            <h1 className={styles.heroTitle}>{COPY.strap}</h1>
            <p className={styles.heroSub}>{COPY.sub}</p>
            <SubscribeForm id="subscribe" initialDone={initialDone} />
          </section>

          {/* Act II — the why */}
          <section className={styles.why} aria-labelledby="the-why">
            <span className={`mono ${styles.kicker}`} id="the-why">
              The why
            </span>
            <p className={styles.whyTension}>{COPY.whyLines[0]}</p>
            <p className={styles.whyAnswer}>{COPY.whyLines[1]}</p>
          </section>

          {/* Act III — the promise + author */}
          <section className={styles.promise} aria-labelledby="the-promise">
            <span className={`mono ${styles.kicker}`} id="the-promise">
              {COPY.promiseKicker}
            </span>
            <ul className={styles.stepsList} aria-label="Build steps">
              {COPY.steps.map((step) => (
                <li key={step} className={styles.stepsItem}>
                  <span className={styles.stepsTick} aria-hidden="true">✓</span>
                  {step}
                </li>
              ))}
            </ul>
            <div className={styles.author}>
              <div className={styles.authorAvatar} aria-hidden="true">
                {COPY.author.initials}
              </div>
              <p className={styles.authorCredential}>{COPY.author.credential}</p>
            </div>
            <blockquote className={styles.houseLine}>{COPY.houseLine}</blockquote>
          </section>

          {/* Act IV — what you'll build */}
          <section className={styles.goods} aria-labelledby="the-goods">
            <span className={`mono ${styles.kicker}`} id="the-goods">
              {COPY.goodsKicker}
            </span>
            <ul className={styles.buildCards}>
              {COPY.goods.map(({ industry, title, build, verb, solves, mode, proofPoints }) => (
                <li key={verb} className={styles.buildCard}>
                  <div className={styles.cardChrome}>
                    <span className={styles.chromeDots} aria-hidden="true">
                      <span /><span /><span />
                    </span>
                    <span className={styles.chromeBar} aria-hidden="true" />
                  </div>
                  <div className={styles.cardBody}>
                    <span className={`mono ${styles.cardIndustry}`}>{industry}</span>
                    <h3 className={styles.cardTitle}>{title}</h3>
                    <p className={styles.cardBuild}>{build}</p>
                    <p className={styles.cardSolves}>{solves}</p>
                    <ul className={styles.cardProofs}>
                      {proofPoints.map((p) => (
                        <li key={p.label}>
                          <strong>{p.value}</strong> {p.label}
                        </li>
                      ))}
                    </ul>
                    <div className={styles.cardFooter}>
                      <StampMark word={verb} color={COLORS.brick} height={28} rotation={-3} title={verb} />
                      <span className={`mono ${styles.cardMode}`}>{mode}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className={styles.goodsTakeaway}>{COPY.goodsTakeaway}</p>
            <p className={styles.goodsCred}>{COPY.goodsCred}</p>
          </section>

          {/* Newsletter CTA */}
          <section className={styles.newsletterCta} aria-labelledby="newsletter-cta-heading">
            <h2 className={styles.newsletterCtaHeading} id="newsletter-cta-heading">
              Start Sunday.<br />Done Friday.
            </h2>
            <p className={styles.newsletterCtaSub}>
              A weekly newsletter for professional service businesses looking to build with AI.
              Every week we take you step by step from idea to reality so you can launch tools
              and products for your business.
            </p>
            <a className={styles.newsletterCtaButton} href="#subscribe">
              Learn more
            </a>
          </section>

          {/* Act V — finale */}
          <section className={styles.finale} aria-labelledby="stamp-your-name">
            <h2 className={styles.finaleHeading} id="stamp-your-name">
              {COPY.finaleHeading}
            </h2>
            <SubscribeForm id="subscribe-finale" initialDone={initialDone} />
          </section>
        </main>

        <footer className={styles.footer}>
          <span className={`mono ${styles.receipts}`}>
            <a href="https://donefriday.com">doneFriday.com</a>
          </span>
          <span className={styles.from}>
            by <a href={COPY.whisperLink.href}>{COPY.whisperLink.label}</a> 2026
          </span>
          <nav className={`mono ${styles.footerLinks}`} aria-label="Legal">
            <a href="/privacy">Privacy</a>
            <span aria-hidden="true">·</span>
            <a href="/terms">Terms</a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
