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
              Every issue, a verb
            </span>
            <div className={styles.verbRow}>
              {COPY.verbs.map((verb, i) => (
                <StampMark
                  key={verb}
                  word={verb}
                  color={COLORS.ink}
                  height={40}
                  rotation={i % 2 === 0 ? -3 : 2.5}
                  title={verb}
                />
              ))}
            </div>
            <p className={styles.promiseCopy}>{COPY.promise}</p>
            <blockquote className={styles.houseLine}>{COPY.houseLine}</blockquote>
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
