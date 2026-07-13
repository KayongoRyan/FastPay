const testimonials = [
  {
    quote:
      "FastPay replaced three apps for me. The yearly budget view finally made sense of my spending — I saved $2,400 in six months.",
    name: "Sarah Chen",
    role: "Freelance Designer",
    initials: "SC",
  },
  {
    quote:
      "We process payroll across three countries. FastPay's global rails cut our transfer fees by 60% and settlement is same-day.",
    name: "Marcus Webb",
    role: "COO, Brightline Studio",
    initials: "MW",
  },
];

export function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonials__header">
          <div className="section-label">Testimonials</div>
          <h2 className="section-title">What Our Users Say</h2>
        </div>
        <div className="testimonials__grid">
          {testimonials.map((t) => (
            <article key={t.name} className="testimonial-card">
              <p className="testimonial-card__quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">{t.initials}</div>
                <div>
                  <div className="testimonial-card__name">{t.name}</div>
                  <div className="testimonial-card__role">{t.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
