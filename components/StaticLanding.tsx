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

/**
 * The static editorial cut — server-rendered for everyone (SEO, pre-JS),
 * and the full experience for reduced-motion / no-WebGL readers.
 * Signup is above the fold; the film is optional, the conversion is not.
 */
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
          <section className={styles.hero}>
            <div className={styles.heroStamp}>
              <StampMark word="DONE" height={72} title="DONE — the Done Friday stamp" />
            </div>
            <h1 className={styles.heroTitle}>{COPY.strap}</h1>
            <p className={styles.heroSub}>
              A weekly letter for owners of small professional-services firms —
              solicitors, accountants, brokers, optometrists. Every issue is one
              end-to-end build, shown working in a real practice. Follow along,
              build it yourself, or steal the source code.
            </p>
            <SubscribeForm id="subscribe" initialDone={initialDone} />
          </section>

          <section className={styles.why} aria-labelledby="the-why">
            <span className={`mono ${styles.kicker}`} id="the-why">
              The why
            </span>
            <p className={styles.whyTension}>{COPY.whyLines[0]}</p>
            <p className={styles.whyAnswer}>{COPY.whyLines[1]}</p>
          </section>

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
            <h2 className={styles.promiseHeading}>{COPY.promiseHeading}</h2>
            <blockquote className={styles.houseLine}>{COPY.houseLine}</blockquote>
          </section>

          <section className={styles.goods} aria-labelledby="the-goods">
            <span className={`mono ${styles.kicker}`} id="the-goods">
              {COPY.goodsKicker}
            </span>
            <ul className={styles.goodsList}>
              {COPY.goods.map(({ build, verb }) => (
                <li className={styles.goodsRow} key={verb}>
                  <span className={styles.goodsBuild}>{build}</span>
                  <StampMark word={verb} color={COLORS.brick} height={30} rotation={-3} title={verb} />
                </li>
              ))}
            </ul>
            <p className={styles.goodsTakeaway}>{COPY.goodsTakeaway}</p>
            <p className={styles.goodsCred}>{COPY.goodsCred}</p>
          </section>

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

          <section className={styles.finale} aria-labelledby="stamp-your-name">
            <h2 className={styles.finaleHeading} id="stamp-your-name">
              {COPY.finaleHeading}
            </h2>
            <SubscribeForm id="subscribe-finale" initialDone={initialDone} />
          </section>
        </main>

        <footer className={styles.footer}>
          <span className={`mono ${styles.receipts}`}>
            Done Friday · donefriday.com · sent weekly, Friday
          </span>
          <span className={styles.from}>
            {COPY.footerFrom}{" "}
            <a href={COPY.whisperLink.href}>{COPY.whisperLink.label}</a>
          </span>
        </footer>
      </div>
    </div>
  );
}
