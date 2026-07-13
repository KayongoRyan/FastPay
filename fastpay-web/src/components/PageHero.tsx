type PageHeroProps = {
  label: string;
  title: string;
  subtitle: string;
  dark?: boolean;
};

export function PageHero({ label, title, subtitle, dark }: PageHeroProps) {
  return (
    <section className={`page-hero${dark ? " page-hero--dark" : ""}`}>
      <div className="page-hero__grid" aria-hidden="true" />
      <div className="container page-hero__inner">
        <span className="section-label">{label}</span>
        <h1 className="page-hero__title">{title}</h1>
        <p className="page-hero__subtitle">{subtitle}</p>
      </div>
    </section>
  );
}
