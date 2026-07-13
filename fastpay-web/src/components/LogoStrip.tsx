const logos = ["Monago", "Shield", "Remdrop", "Vaultex", "Paygrid", "Nexora"];

export function LogoStrip() {
  return (
    <section className="logo-strip" aria-label="Trusted by">
      <div className="container">
        <span className="logo-strip__label">Trusted by industry leaders</span>
        <div className="logo-strip__logos">
          {logos.map((name) => (
            <span key={name} className="logo-strip__logo">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
