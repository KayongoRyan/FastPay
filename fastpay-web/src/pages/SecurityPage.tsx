import { Link } from 'react-router-dom';
import {
  Bell,
  Fingerprint,
  Lock,
  ScanLine,
  Server,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { SecurityHero } from '../components/SecurityHero';
import { CtaStrip } from '../components/CtaStrip';

const pillars = [
  {
    icon: Fingerprint,
    title: 'Device binding',
    desc: 'Biometric unlock with Ed25519 challenge-response. Trusted devices are registered and revocable from Security Center.',
  },
  {
    icon: Lock,
    title: 'Transaction signing',
    desc: 'Payments are signed on-device before relay. The server verifies every signature before broadcast.',
  },
  {
    icon: ScanLine,
    title: 'Fraud screening',
    desc: 'Rules engine plus address screening on every transfer. High-risk transactions are blocked or held for review.',
  },
  {
    icon: Server,
    title: 'Audit trail',
    desc: 'Login, session, and payment events are logged with severity levels. Review activity from the mobile Security Center.',
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: 'Multi-session control',
    desc: 'See every active session, revoke unknown devices, and sign out everywhere except your current phone.',
  },
  {
    icon: Bell,
    title: 'Security alerts',
    desc: 'Get notified on new sign-ins, device enrollments, and flagged transactions.',
  },
  {
    icon: Shield,
    title: 'Self-service freeze',
    desc: 'Instantly freeze your account from the app if you suspect unauthorized access.',
  },
];

export function SecurityPage() {
  return (
    <>
      <SecurityHero />

      <section className="page-section" id="security-pillars">
        <div className="container">
          <div className="page-section__header page-section__header--center">
            <div className="section-label">Pillars</div>
            <h2 className="section-title">How FastPay Protects Your Money</h2>
          </div>
          <div className="capabilities-grid">
            {pillars.map((p) => (
              <article key={p.title} className="capability-card">
                <div className="capability-card__icon">
                  <p.icon size={22} />
                </div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section--alt">
        <div className="container">
          <div className="page-section__header page-section__header--center">
            <div className="section-label">Security Center</div>
            <h2 className="section-title">Live Controls In The App</h2>
            <p className="section-subtitle">
              The authenticated Security Center lives in FastPay mobile (Expo + Flutter).
              Download the app to manage sessions, devices, and alerts.
            </p>
          </div>
          <div className="services-page__grid">
            {features.map((f) => (
              <article key={f.title} className="service-detail-card">
                <div className="service-detail-card__icon">
                  <f.icon size={24} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container split-panel">
          <div className="split-panel__content">
            <div className="section-label">Defense in depth</div>
            <h2 className="section-title">Layers From Device To Gateway</h2>
            <p className="section-subtitle">
              Auto-lock after background timeout, optional screen capture blocking on PIN
              screens, API rate limits, security headers, and request tracing end-to-end.
            </p>
            <Link to="/contact" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Talk to our team
            </Link>
          </div>
          <div className="split-panel__visual">
            <div className="split-panel__mockup">
              <div className="split-panel__mockup-row">
                <span>Gateway</span>
                <strong>HSTS + rate limits</strong>
              </div>
              <div className="split-panel__mockup-row">
                <span>Fraud engine</span>
                <strong style={{ color: 'var(--aqua)' }}>Rules + screening</strong>
              </div>
              <div className="split-panel__mockup-row">
                <span>Audit service</span>
                <strong>Sessions + alerts</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaStrip
        title="Security you can see and control"
        subtitle="Open Security Center in the FastPay app after signing in."
        ctaLabel="View pricing"
        ctaTo="/pricing"
      />
    </>
  );
}
