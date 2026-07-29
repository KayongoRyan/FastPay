import { Banknote, FileText, QrCode, TrendingUp } from "lucide-react";

type MerchantAuthVisualProps = {
  mode: "login" | "register";
};

const copy = {
  login: {
    eyebrow: "Merchant portal",
    title: (
      <>
        Sign in to your
        <br />
        business dashboard.
      </>
    ),
    body: "Accept Bank Pay, send invoices, and track settlements — separate from consumer wallets.",
  },
  register: {
    eyebrow: "Get started",
    title: (
      <>
        Register your
        <br />
        business on FastPay.
      </>
    ),
    body: "Get a merchant code, invoice customers, and receive payments straight to your settlement account.",
  },
} as const;

export function MerchantAuthVisual({ mode }: MerchantAuthVisualProps) {
  const c = copy[mode];

  return (
    <aside className="auth-panel">
      <div className="auth-panel__copy-block">
        <p className="auth-panel__eyebrow">{c.eyebrow}</p>
        <h1 className="auth-panel__title">{c.title}</h1>
        <p className="auth-panel__copy">{c.body}</p>
      </div>

      <div className="auth-merchant" aria-hidden="true">
        <div className="auth-merchant__card">
          <div className="auth-merchant__head">
            <span className="auth-merchant__mark">M</span>
            <div>
              <small>FastPay Merchant</small>
              <strong>Kigali Coffee Co.</strong>
            </div>
            <span className="auth-merchant__code">KC-4821</span>
          </div>

          <div className="auth-merchant__stat">
            <span>Today&apos;s revenue</span>
            <strong>RWF 342,000</strong>
            <em>
              <TrendingUp size={12} strokeWidth={2.5} /> +18% vs yesterday
            </em>
          </div>

          <ul className="auth-merchant__list">
            <li>
              <FileText size={14} />
              <div>
                <strong>Invoice #1042</strong>
                <small>Paid · Bank Pay</small>
              </div>
              <em>+85,000</em>
            </li>
            <li>
              <Banknote size={14} />
              <div>
                <strong>Counter sale</strong>
                <small>10:24 AM</small>
              </div>
              <em>+12,500</em>
            </li>
          </ul>

          <div className="auth-merchant__qr">
            <QrCode size={16} />
            <span>Bank Pay · KC-4821</span>
          </div>
        </div>

        <div className="auth-merchant__float auth-merchant__float--paid">
          <strong>Invoice paid</strong>
          <span>RWF 85,000 received</span>
        </div>
      </div>
    </aside>
  );
}
