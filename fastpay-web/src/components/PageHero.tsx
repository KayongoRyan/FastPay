type PageHeroProps = {
  label: string;
  title: string;
  subtitle: string;
  dark?: boolean;
  plain?: boolean;
  vivid?: boolean;
};

export function PageHero({ label, title, subtitle, dark, plain, vivid }: PageHeroProps) {
  const className = [
    "page-hero",
    dark ? "page-hero--dark" : "",
    plain ? "page-hero--plain" : "",
    vivid ? "page-hero--vivid" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={className}>
      {vivid && (
        <div className="page-hero__ambient" aria-hidden="true">
          <span className="page-hero__orb page-hero__orb--aqua" />
          <span className="page-hero__orb page-hero__orb--violet" />
          <span className="page-hero__orb page-hero__orb--sunset" />
          <span className="page-hero__shine" />
        </div>
      )}

      <div className="container page-hero__inner">
        <span className={vivid ? "page-hero__badge" : "section-label"}>{label}</span>
        <h1 className="page-hero__title">{title}</h1>
        <p className="page-hero__subtitle">{subtitle}</p>
      </div>
    </section>
  );
}
