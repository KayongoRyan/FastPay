import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CircleDollarSign,
  ShieldCheck,
} from "lucide-react";

const services = [
  { label: "Send", icon: ArrowUpRight },
  { label: "Receive", icon: ArrowDownLeft },
  { label: "Convert", icon: ArrowLeftRight },
  { label: "Buy", icon: CircleDollarSign },
];

const bars = [42, 58, 48, 72, 65, 80, 68];

export function AppHomePreview() {
  return (
    <div className="app-preview">
      <div className="app-preview__top">
        <div>
          <p className="app-preview__greeting">Good Morning,</p>
          <h3 className="app-preview__name">Future Pluto</h3>
        </div>
        <div className="app-preview__avatar">FP</div>
      </div>

      <div className="app-preview__balance">
        <div>
          <span>Total Balance</span>
          <strong>RWF 1,248,500</strong>
        </div>
        <span className="app-preview__delta">+12.5%</span>
      </div>

      <div className="app-preview__card">
        <div className="app-preview__card-top">
          <span className="app-preview__chip" />
          <span className="app-preview__card-brand">FASTPAY</span>
        </div>
        <p className="app-preview__card-number">4821 •••• •••• 4821</p>
        <div className="app-preview__card-meta">
          <div>
            <small>VALID THRU</small>
            <strong>12/28</strong>
          </div>
          <div>
            <small>CARDHOLDER</small>
            <strong>F. PLUTO</strong>
          </div>
          <span className="app-preview__contactless">)))</span>
        </div>
      </div>

      <p className="app-preview__section">Services</p>
      <div className="app-preview__services">
        {services.map(({ label, icon: Icon }) => (
          <div key={label} className="app-preview__service">
            <span>
              <Icon size={14} strokeWidth={2.5} />
            </span>
            <small>{label}</small>
          </div>
        ))}
      </div>

      <div className="app-preview__chart">
        <div className="app-preview__chart-head">
          <span>Weekly spending</span>
          <strong>RWF 186K</strong>
        </div>
        <div className="app-preview__bars">
          {bars.map((h, i) => (
            <span key={i} className={i === 5 ? "active" : ""} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      <p className="app-preview__section">Recent</p>
      <div className="app-preview__tx">
        <span className="app-preview__tx-icon app-preview__tx-icon--up">
          <ArrowDownLeft size={12} />
        </span>
        <div>
          <strong>MoMo Top-up</strong>
          <small>Today · MTN</small>
        </div>
        <span className="app-preview__tx-amount up">+50K</span>
      </div>

      <nav className="app-preview__nav">
        <span className="active">Home</span>
        <span>Analytics</span>
        <span>Bills</span>
        <span>Settings</span>
      </nav>
    </div>
  );
}

export function HeroFloatCards() {
  return (
    <>
      <div className="hero-float hero-float--kyc">
        <ShieldCheck size={18} />
        <div>
          <strong>KYC verified</strong>
          <span>Higher limits unlocked</span>
        </div>
      </div>

      <div className="hero-float hero-float--secure">
        <span className="hero-float__pulse" />
        <div>
          <strong>Fraud shield active</strong>
          <span>24/7 transaction monitoring</span>
        </div>
      </div>

      <div className="hero-float hero-float--budget">
        <span>Budget</span>
        <strong>62%</strong>
        <small>of weekly limit used</small>
      </div>
    </>
  );
}
