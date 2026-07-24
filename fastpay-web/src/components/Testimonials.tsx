import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ensureGsap, prefersReducedMotion } from "../lib/motion";

const testimonials = [
  {
    quote:
      "FastPay replaced three apps for me. The yearly budget view finally made sense of my spending — I saved over RWF 2M in six months.",
    name: "Sarah Chen",
    role: "Freelance Designer",
    avatar: "https://i.pravatar.cc/120?img=47",
    offset: "right",
  },
  {
    quote:
      "We process payroll across three countries. FastPay's global rails cut our transfer fees by 60% and settlement is same-day.",
    name: "Marcus Webb",
    role: "COO, Brightline Studio",
    avatar: "https://i.pravatar.cc/120?img=12",
    offset: "left",
  },
  {
    quote:
      "MoMo top-ups, Stellar payouts, and family plans in one wallet. Support answered in minutes when I locked a lost device.",
    name: "Amina Nkusi",
    role: "Small business owner",
    avatar: "https://i.pravatar.cc/120?img=32",
    offset: "right",
  },
];

function QuoteMark() {
  return (
    <svg
      className="testimonial-card__mark"
      viewBox="0 0 32 28"
      aria-hidden="true"
    >
      <path
        d="M8 0C3.6 0 0 3.6 0 8c0 5.2 3.4 9.8 8.4 13.2L6 28l6.8-2.4C16.2 27.2 19 28 22 28c4.4 0 8-3.6 8-8V8c0-4.4-3.6-8-8-8H8zm14 0c-4.4 0-8 3.6-8 8v12c0 1.6.4 3.1 1.1 4.4 2.8-1.2 5.2-3 6.9-5.2V8c0-4.4-3.6-8-8-8h-2z"
        fill="currentColor"
      />
    </svg>
  );
}

function TestimonialsDecor() {
  return (
    <svg
      className="testimonials__decor"
      viewBox="0 0 220 72"
      aria-hidden="true"
    >
      <path
        className="testimonials__decor-line"
        d="M8 52 C36 18, 72 8, 108 22 S168 58, 196 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        className="testimonials__decor-arrow"
        d="M188 24 L204 28 L196 38"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="testimonials__decor-star"
        d="M212 18 L214.2 23.8 L220 24.5 L215.5 28.5 L216.8 34.2 L212 31.2 L207.2 34.2 L208.5 28.5 L204 24.5 L209.8 23.8 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(1);

  useGSAP(
    () => {
      ensureGsap();
      const section = sectionRef.current;
      if (!section || prefersReducedMotion()) return;

      gsap.from(section.querySelector(".testimonials__decor-line"), {
        strokeDashoffset: 120,
        duration: 1.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
      });

      gsap.from(section.querySelector(".testimonials__decor-star"), {
        scale: 0,
        rotation: -40,
        duration: 0.5,
        delay: 0.9,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section className="testimonials" id="testimonials" ref={sectionRef}>
      <div className="container">
        <TestimonialsDecor />

        <div className="testimonials__layout">
          <div className="testimonials__intro">
            <h2 className="testimonials__title">What Our Customers Says</h2>
            <p className="testimonials__lede">
              Real stories from people who moved money, tracked budgets, and kept
              family plans on one secure wallet across East Africa and beyond.
            </p>
            <Link to="/contact" className="testimonials__cta">
              View More
            </Link>
          </div>

          <div className="testimonials__stack">
            {testimonials.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <article
                  key={item.name}
                  className={[
                    "testimonial-card",
                    `testimonial-card--${item.offset}`,
                    isActive ? "testimonial-card--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  tabIndex={0}
                >
                  <img
                    className="testimonial-card__avatar"
                    src={item.avatar}
                    alt=""
                    width={56}
                    height={56}
                    loading="lazy"
                  />
                  <div className="testimonial-card__body">
                    <QuoteMark />
                    <h3 className="testimonial-card__name">{item.name}</h3>
                    <p className="testimonial-card__quote">{item.quote}</p>
                    <span className="testimonial-card__role">{item.role}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
