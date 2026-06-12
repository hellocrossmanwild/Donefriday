import s from "./BuildMockup.module.css";

type MockupType = "chat" | "invoice" | "screening";

export default function BuildMockup({ type, compact = false }: { type: MockupType; compact?: boolean }) {
  const cls = compact ? `${s.root} ${s.compact}` : s.root;
  if (type === "chat") return <ChatMockup cls={cls} />;
  if (type === "invoice") return <InvoiceMockup cls={cls} />;
  return <ScreeningMockup cls={cls} />;
}

function ChatMockup({ cls }: { cls: string }) {
  return (
    <div className={`${cls} ${s.chat}`}>
      <div className={s.chatHeader}>
        <span className={s.onlineDot} aria-hidden="true" />
        <span className={s.chatName}>Legal Assistant</span>
        <span className={s.chatSub}>Online now</span>
      </div>
      <div className={s.chatBody}>
        <div className={`${s.bubble} ${s.bubbleBot}`}>
          Hi — I&apos;m the Wright &amp; Co virtual assistant. How can I help?
        </div>
        <div className={`${s.bubble} ${s.bubbleUser}`}>
          I need advice on a contract dispute
        </div>
        <div className={`${s.bubble} ${s.bubbleBot}`}>
          Of course. May I take your name and contact number?
        </div>
      </div>
      <div className={s.chatInput}>
        <span className={s.chatPlaceholder}>Type a message…</span>
        <span className={s.chatSend} aria-hidden="true">→</span>
      </div>
    </div>
  );
}

function InvoiceMockup({ cls }: { cls: string }) {
  return (
    <div className={`${cls} ${s.invoice}`}>
      <div className={s.invoiceHeader}>
        <span className={s.invoiceTitle}>Outstanding invoices</span>
        <span className={s.invoiceBadge}>3</span>
      </div>
      <div className={s.invoiceList}>
        {[
          { ref: "INV-2041", client: "Heywood Group", amount: "£3,200", status: "CHASED", paid: false },
          { ref: "INV-2039", client: "Briar & Co",    amount: "£1,450", status: "CHASED", paid: false },
          { ref: "INV-2038", client: "Whitmore Ltd",  amount: "£850",   status: "PAID ✓", paid: true  },
        ].map((row) => (
          <div key={row.ref} className={s.invoiceRow}>
            <span className={s.invoiceRef}>{row.ref}</span>
            <span className={s.invoiceClient}>{row.client}</span>
            <span className={s.invoiceAmount}>{row.amount}</span>
            <span className={`${s.statusBadge} ${row.paid ? s.statusPaid : s.statusChased}`}>
              {row.status}
            </span>
          </div>
        ))}
      </div>
      <div className={s.invoiceStat}>
        <span className={s.invoiceStatLabel}>Recovered this month</span>
        <span className={s.invoiceStatValue}>£4,650</span>
      </div>
    </div>
  );
}

function ScreeningMockup({ cls }: { cls: string }) {
  return (
    <div className={`${cls} ${s.screening}`}>
      <div className={s.videoArea}>
        <div className={s.videoPlaceholder}>
          <div className={s.videoAvatar}>SM</div>
          <div className={s.videoMeta}>
            <span className={s.videoName}>Sarah Mitchell</span>
            <span className={s.videoRole}>Senior Account Manager</span>
          </div>
        </div>
        <div className={s.recBadge} aria-hidden="true">
          <span className={s.recDot} /> REC &nbsp; Q2/5
        </div>
      </div>
      <div className={s.questionArea}>
        <span className={s.questionLabel}>Current question</span>
        <p className={s.questionText}>&ldquo;Describe a time you turned a difficult client around&rdquo;</p>
      </div>
      <div className={s.scoreArea}>
        <span className={s.scoreLabel}>Score</span>
        <div className={s.scoreBar} role="meter" aria-valuenow={82} aria-valuemin={0} aria-valuemax={100}>
          <div className={s.scoreFill} style={{ width: "82%" }} />
        </div>
        <span className={s.scoreValue}>4.1 / 5</span>
      </div>
    </div>
  );
}
