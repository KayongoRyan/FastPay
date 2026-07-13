export function FeatureCards() {
  return (
    <section className="features">
      <div className="container">
        <div className="features__grid">
          <article className="feature-card feature-card--light">
            <span className="feature-card__tag">Cards</span>
            <h2 className="feature-card__title">Create Custom Cards In Minutes</h2>
            <p className="feature-card__desc">
              Issue virtual and physical cards with real-time balance controls and
              spending limits.
            </p>
            <div className="feature-card__visual">
              <div className="card-mockup">
                <div className="card-mockup__chip" />
                <div className="card-mockup__balance-label">Available Balance</div>
                <div className="card-mockup__balance">$3,403.09</div>
                <div className="card-mockup__number">•••• 4821</div>
              </div>
            </div>
          </article>

          <article className="feature-card feature-card--accent">
            <span className="feature-card__tag">Transfers</span>
            <h2 className="feature-card__title">Send Money Anywhere, Instantly</h2>
            <p className="feature-card__desc">
              Low-fee global transfers with live FX rates and instant delivery to
              120+ countries.
            </p>
            <div className="feature-card__visual">
              <div className="transfer-visual">
                <div className="transfer-visual__person" />
                <div className="transfer-visual__float">
                  Total Balance
                  <strong>$9,647.00</strong>
                </div>
              </div>
            </div>
          </article>

          <article className="feature-card feature-card--light">
            <span className="feature-card__tag">Insights</span>
            <h2 className="feature-card__title">Personalized Financial Insights</h2>
            <p className="feature-card__desc">
              Track goals, spot trends, and get smart recommendations from your
              FastPay assistant.
            </p>
            <div className="feature-card__visual">
              <div className="insights-visual">
                <PhoneChart />
                <PhoneChart tall />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function PhoneChart({ tall }: { tall?: boolean }) {
  return (
    <div className="phone-mockup" style={tall ? { height: 180 } : undefined}>
      <div className="phone-mockup__screen">
        <div className="phone-mockup__bar phone-mockup__bar--fill" />
        <div className="phone-mockup__bar" style={{ width: "50%" }} />
        <div className="phone-mockup__chart">
          <div className="phone-mockup__col" style={{ height: "40%" }} />
          <div className="phone-mockup__col" />
          <div className="phone-mockup__col" />
          <div className="phone-mockup__col" style={{ height: "55%" }} />
        </div>
      </div>
    </div>
  );
}
