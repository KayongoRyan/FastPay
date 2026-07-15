import { useState } from "react";
import { ArrowUpRight, Send } from "lucide-react";

const locations = [
  {
    city: "Kigali",
    role: "Headquarters",
    lines: ["KG 7 Ave, Kacyiru", "Kigali, Rwanda"],
    phone: "+250 788 000 000",
  },
  {
    city: "Nairobi",
    role: "East Africa",
    lines: ["Westlands Business Park", "Nairobi, Kenya"],
    phone: "+254 700 000 000",
  },
  {
    city: "Remote",
    role: "Support desk",
    lines: ["Chat & email coverage", "Across CET / CAT"],
    phone: null,
  },
];

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <section className="contact-hero">
        <div className="container contact-hero__inner">
          <p className="contact-hero__brand">FastPay</p>
          <h1 className="contact-hero__title">
            Talk to the people
            <br />
            behind the wallet.
          </h1>
          <p className="contact-hero__lede">
            Sales, partnerships, or account help — write us once. We answer within
            one business day.
          </p>
        </div>
      </section>

      <section className="contact-main">
        <div className="container contact-main__grid">
          <aside className="contact-rail">
            <div className="contact-rail__group">
              <span className="contact-rail__label">Email</span>
              <a href="mailto:support@fastpay.com" className="contact-rail__link">
                support@fastpay.com
                <ArrowUpRight size={18} strokeWidth={2} />
              </a>
            </div>

            <div className="contact-rail__group">
              <span className="contact-rail__label">Sales</span>
              <a href="mailto:hello@fastpay.com" className="contact-rail__link">
                hello@fastpay.com
                <ArrowUpRight size={18} strokeWidth={2} />
              </a>
            </div>

            <div className="contact-rail__group">
              <span className="contact-rail__label">Phone</span>
              <a href="tel:+250788000000" className="contact-rail__link">
                +250 788 000 000
              </a>
            </div>

            <div className="contact-rail__group">
              <span className="contact-rail__label">Hours</span>
              <p className="contact-rail__text">
                Mon–Fri · 09:00–18:00 CAT
                <br />
                Weekends · chat & email only
              </p>
            </div>
          </aside>

          <div className="contact-compose">
            <header className="contact-compose__head">
              <h2>Write a message</h2>
              <p>No ticket bots. A person on the FastPay team reads this.</p>
            </header>

            {submitted ? (
              <div className="contact-compose__done">
                <p className="contact-compose__done-kicker">Sent</p>
                <h3>We have your note.</h3>
                <p>Expect a reply to the email you left — usually same day.</p>
              </div>
            ) : (
              <form className="contact-compose__form" onSubmit={handleSubmit}>
                <div className="contact-compose__row">
                  <label>
                    <span>First name</span>
                    <input type="text" name="firstName" required autoComplete="given-name" />
                  </label>
                  <label>
                    <span>Last name</span>
                    <input type="text" name="lastName" required autoComplete="family-name" />
                  </label>
                </div>

                <label>
                  <span>Email</span>
                  <input type="email" name="email" required autoComplete="email" />
                </label>

                <label>
                  <span>Topic</span>
                  <select name="subject" required defaultValue="">
                    <option value="" disabled>
                      Choose one
                    </option>
                    <option value="general">General</option>
                    <option value="sales">Sales & pricing</option>
                    <option value="support">Account support</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </label>

                <label>
                  <span>Message</span>
                  <textarea name="message" required rows={6} />
                </label>

                <button type="submit" className="contact-compose__submit">
                  Send message
                  <Send size={16} strokeWidth={2.25} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="contact-places">
        <div className="container">
          <div className="contact-places__intro">
            <h2>Where we work</h2>
            <p>East Africa first. Support follows the clock where your money moves.</p>
          </div>

          <ul className="contact-places__list">
            {locations.map((loc) => (
              <li key={loc.city} className="contact-places__item">
                <div className="contact-places__city">
                  <strong>{loc.city}</strong>
                  <span>{loc.role}</span>
                </div>
                <div className="contact-places__addr">
                  {loc.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </div>
                {loc.phone ? (
                  <a href={`tel:${loc.phone.replace(/\s/g, "")}`} className="contact-places__phone">
                    {loc.phone}
                  </a>
                ) : (
                  <span className="contact-places__phone contact-places__phone--muted">
                    In-app chat
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
