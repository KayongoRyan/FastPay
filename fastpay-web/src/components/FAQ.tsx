import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How does FastPay keep my money secure?",
    a: "We use bank-grade encryption, biometric authentication, device binding, and real-time fraud monitoring on every transaction.",
  },
  {
    q: "Can I switch between weekly, monthly, and yearly budgets?",
    a: "Yes. The analytics dashboard lets you toggle between all three periods so you can zoom in on short-term spending or review annual trends.",
  },
  {
    q: "What currencies do you support for convert?",
    a: "FastPay supports 40+ fiat currencies with live mid-market rates. Pro and Business plans include rate alerts and zero markup on conversions.",
  },
  {
    q: "Is there a fee for international transfers?",
    a: "Domestic transfers are free on all plans. International transfers start at 0.5% with transparent pricing shown before you confirm.",
  },
  {
    q: "How does the AI assistant work?",
    a: "The assistant runs on-device first for fast answers about balances and budgets, then escalates to cloud for complex questions — always grounded in your data.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="faq__layout">
          <div>
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Everything you need to know about FastPay. Can&apos;t find an answer?
              Reach out to our support team.
            </p>
          </div>
          <div className="faq__list">
            {faqs.map((item, i) => (
              <div
                key={item.q}
                className={`faq__item${openIndex === i ? " open" : ""}`}
              >
                <button
                  type="button"
                  className="faq__question"
                  aria-expanded={openIndex === i}
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  {item.q}
                  <ChevronDown size={18} />
                </button>
                {openIndex === i && <p className="faq__answer">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
