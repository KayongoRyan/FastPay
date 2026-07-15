import {
  ArrowDownLeft,
  ArrowUpRight,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

type AuthWalletVisualProps = {
  mode: "login" | "signup";
};

const copy = {
  login: {
    eyebrow: "Welcome back",
    title: (
      <>
        Sign in to
        <br />
        your wallet.
      </>
    ),
    body: "Same account as the FastPay app — balances, transfers, and security controls follow you here.",
  },
  signup: {
    eyebrow: "Get started",
    title: (
      <>
        Open a FastPay
        <br />
        account.
      </>
    ),
    body: "RWF-first wallet with device binding, signed payments, and fraud checks from day one.",
  },
} as const;

export function AuthWalletVisual({ mode }: AuthWalletVisualProps) {
  const c = copy[mode];

  return (
    <aside className="auth-panel">
      <div className="auth-panel__copy-block">
        <p className="auth-panel__eyebrow">{c.eyebrow}</p>
        <h1 className="auth-panel__title">{c.title}</h1>
        <p className="auth-panel__copy">{c.body}</p>
      </div>

      <div className="auth-wallet" aria-hidden="true">
        <div className="auth-wallet__phone">
          <div className="auth-wallet__notch" />
          <div className="auth-wallet__screen">
            <div className="auth-wallet__status">
              <span>9:41</span>
              <span className="auth-wallet__signal" />
            </div>

            <div className="auth-wallet__greet">
              <div>
                <small>FastPay Wallet</small>
                <strong>Future Pluto</strong>
              </div>
              <span className="auth-wallet__avatar">FP</span>
            </div>

            <div className="auth-wallet__balance">
              <span>Available balance</span>
              <strong>RWF 1,248,500</strong>
              <em>+RWF 86,200 this week</em>
            </div>

            <div className="auth-wallet__card">
              <div className="auth-wallet__card-top">
                <span className="auth-wallet__chip" />
                <span>FASTPAY</span>
              </div>
              <p>4821 •••• •••• 9012</p>
              <div className="auth-wallet__card-meta">
                <span>F. PLUTO</span>
                <span>12/28</span>
              </div>
            </div>

            <div className="auth-wallet__actions">
              <span>
                <ArrowUpRight size={14} strokeWidth={2.5} />
                Send
              </span>
              <span>
                <ArrowDownLeft size={14} strokeWidth={2.5} />
                Receive
              </span>
              <span>
                <Fingerprint size={14} strokeWidth={2.5} />
                Unlock
              </span>
            </div>

            <div className="auth-wallet__tx">
              <span className="auth-wallet__tx-dot" />
              <div>
                <strong>MoMo received</strong>
                <small>Today · MTN</small>
              </div>
              <em>+50,000</em>
            </div>
          </div>
        </div>

        <div className="auth-wallet__float auth-wallet__float--secure">
          <ShieldCheck size={16} />
          <div>
            <strong>Protected</strong>
            <span>Device bound</span>
          </div>
        </div>

        <div className="auth-wallet__float auth-wallet__float--move">
          <strong>RWF → KES</strong>
          <span>Instant transfer ready</span>
        </div>
      </div>
    </aside>
  );
}
