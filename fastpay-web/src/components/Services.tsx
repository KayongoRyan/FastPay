import { Link } from "react-router-dom";
import { services } from "../data/services";

export function Services() {
  return (
    <section className="services" id="services">
      <div className="container">
        <div className="services__header">
          <div className="section-label">What We Offer</div>
          <h2 className="section-title">Everything You Need To Move Money</h2>
          <p className="section-subtitle">
            From everyday spending to cross-border transfers, FastPay gives you the
            tools to manage, grow, and protect your finances.
          </p>
        </div>
        <div className="services__grid">
          {services.map((s) => (
            <article key={s.title} className="service-item">
              <div className="service-item__icon">
                <s.icon size={22} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </article>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link to="/services" className="btn btn-outline">
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}
