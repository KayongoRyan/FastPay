import { Copy, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { walletAccount } from "../../lib/wallet-data";

function pseudoQrCells(seed: string, size = 13): boolean[] {
  let h = 2166136261;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i;
    h = Math.imul(h, 16777619);
    cells.push(((h >>> 13) & 3) !== 0 ? (h & 1) === 1 : true);
  }
  return cells;
}

export function AppReceivePage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState<string | null>(null);
  const cells = useMemo(() => pseudoQrCells(walletAccount.accountNumber), []);

  async function copy(value: string, tag: string) {
    await navigator.clipboard.writeText(value).catch(() => undefined);
    setCopied(tag);
    setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="wapp-page">
      <div className="wapp-grid-2">
        <section className="wapp-card wapp-receive">
          <header className="wapp-card__head">
            <h2>Receive to your wallet</h2>
          </header>
          <p className="wapp-form-card__hint">
            Share your account number or let the sender scan this code in the FastPay app.
          </p>

          <div className="wapp-qr" role="img" aria-label="Wallet QR code">
            {cells.map((on, i) => (
              <span key={i} className={on ? "on" : ""} />
            ))}
          </div>

          <div className="wapp-receive__lines">
            <button
              type="button"
              className="wapp-account-line"
              onClick={() => copy(walletAccount.accountNumber, "acc")}
            >
              <span>{walletAccount.accountNumber}</span>
              <Copy size={15} />
              {copied === "acc" && <em>Copied</em>}
            </button>

            {user?.phone && (
              <button
                type="button"
                className="wapp-account-line"
                onClick={() => copy(user.phone!, "phone")}
              >
                <span>{user.phone}</span>
                <Copy size={15} />
                {copied === "phone" && <em>Copied</em>}
              </button>
            )}
          </div>
        </section>

        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>How it works</h2>
          </header>
          <ol className="wapp-steps">
            <li>
              <strong>Share your account</strong>
              <span>Account number, phone, or the QR code — all point to the same wallet.</span>
            </li>
            <li>
              <strong>Sender pays from FastPay or MoMo</strong>
              <span>Transfers from other FastPay users settle instantly.</span>
            </li>
            <li>
              <strong>You get notified</strong>
              <span>The deposit shows in Recent activity and your balance updates.</span>
            </li>
          </ol>

          <button
            type="button"
            className="btn-ghost-navy wapp-share"
            onClick={() => copy(`FastPay · ${walletAccount.accountNumber}`, "share")}
          >
            <Share2 size={16} />
            {copied === "share" ? "Copied share text" : "Copy share text"}
          </button>
        </section>
      </div>
    </div>
  );
}
