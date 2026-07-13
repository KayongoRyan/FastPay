import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

type CtaStripProps = {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaTo?: string;
};

export function CtaStrip({
  title,
  subtitle,
  ctaLabel = "Get Started",
  ctaTo = "/pricing",
}: CtaStripProps) {
  return (
    <section className="cta-strip">
      <div className="container cta-strip__inner">
        <div>
          <h2 className="cta-strip__title">{title}</h2>
          <p className="cta-strip__subtitle">{subtitle}</p>
        </div>
        <Link to={ctaTo} className="btn btn-primary">
          {ctaLabel}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
