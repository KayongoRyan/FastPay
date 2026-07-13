import { Clock, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { useState } from "react";
import { PageHero } from "../components/PageHero";

const offices = [
  {
    city: "New York",
    address: "350 Fifth Avenue, Suite 4200",
    zip: "NY 10118, USA",
    phone: "+1 (800) 555-FAST",
  },
  {
    city: "London",
    address: "1 Canada Square, Level 38",
    zip: "E14 5AB, UK",
    phone: "+44 20 7946 0958",
  },
  {
    city: "Singapore",
    address: "1 Raffles Place, Tower 2",
    zip: "048616, Singapore",
    phone: "+65 6123 4567",
  },
];

const supportChannels = [
  {
    icon: MessageSquare,
    title: "Live Chat",
    desc: "Available 24/7 in-app. Average response under 2 minutes.",
  },
  {
    icon: Mail,
    title: "Email Support",
    desc: "support@fastpay.com — we reply within 4 business hours.",
  },
  {
    icon: Phone,
    title: "Phone",
    desc: "Business plan customers get a dedicated line Mon–Fri 9am–6pm.",
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
      <PageHero
        label="Contact"
        title="We'd Love To Hear From You"
        subtitle="Questions about plans, partnerships, or support — our team is here to help."
        dark
      />

      <section className="page-section">
        <div className="container contact-page__layout">
          <div className="contact-form-card">
            <h2>Send Us A Message</h2>
            <p>Fill out the form and we&apos;ll get back to you within one business day.</p>
            {submitted ? (
              <div className="contact-form__success">
                <Send size={32} />
                <h3>Message sent!</h3>
                <p>Thanks for reaching out. We&apos;ll be in touch shortly.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form__row">
                  <label>
                    First name
                    <input type="text" name="firstName" required placeholder="Jane" />
                  </label>
                  <label>
                    Last name
                    <input type="text" name="lastName" required placeholder="Doe" />
                  </label>
                </div>
                <label>
                  Email
                  <input type="email" name="email" required placeholder="jane@company.com" />
                </label>
                <label>
                  Subject
                  <select name="subject" required defaultValue="">
                    <option value="" disabled>
                      Select a topic
                    </option>
                    <option value="general">General inquiry</option>
                    <option value="sales">Sales & pricing</option>
                    <option value="support">Technical support</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </label>
                <label>
                  Message
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us how we can help..."
                  />
                </label>
                <button type="submit" className="btn btn-primary">
                  Send Message
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>

          <div className="contact-info">
            <div className="contact-info__block">
              <h3>Support Channels</h3>
              <div className="contact-info__channels">
                {supportChannels.map((ch) => (
                  <article key={ch.title} className="contact-channel">
                    <div className="contact-channel__icon">
                      <ch.icon size={20} />
                    </div>
                    <div>
                      <h4>{ch.title}</h4>
                      <p>{ch.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="contact-info__block">
              <h3>
                <Clock size={18} />
                Business Hours
              </h3>
              <p>Mon – Fri: 9:00 AM – 6:00 PM (local time)</p>
              <p>Sat – Sun: Email & live chat only</p>
            </div>

            <div className="contact-info__block contact-info__direct">
              <p>
                <Mail size={16} />
                support@fastpay.com
              </p>
              <p>
                <Phone size={16} />
                +1 (800) 555-FAST
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section page-section--alt">
        <div className="container">
          <div className="page-section__header page-section__header--center">
            <div className="section-label">Offices</div>
            <h2 className="section-title">Our Global Locations</h2>
          </div>
          <div className="offices-grid">
            {offices.map((office) => (
              <article key={office.city} className="office-card">
                <div className="office-card__icon">
                  <MapPin size={20} />
                </div>
                <h3>{office.city}</h3>
                <p>{office.address}</p>
                <p>{office.zip}</p>
                <a href={`tel:${office.phone.replace(/\s/g, "")}`} className="office-card__phone">
                  {office.phone}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
