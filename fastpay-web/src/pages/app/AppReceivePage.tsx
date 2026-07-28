import { Copy, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../hooks/useWallet";

export function AppReceivePage() {
  const { user } = useAuth();
  const { wallet } = useWallet();
  const [copied, setCopied] = useState<string | null>(null);
  const accountNumber = wallet?.accountNumber ?? "—";

  const qrPayload = useMemo(() => {
    const params = new URLSearchParams({
      account: accountNumber,
      ...(user?.fullName ? { name: user.fullName } : {}),
      ...(user?.phone ? { phone: user.phone } : {}),
    });
    return `fastpay://pay?${params.toString()}`;
  }, [user, accountNumber]);

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

          <div className="wapp-qr">
            <QRCodeSVG
              value={qrPayload}
              size={196}
              level="M"
              bgColor="#ffffff"
              fgColor="#0b1f3f"
              marginSize={1}
              title="Wallet QR code"
              imageSettings={{
                src:
                  "data:image/svg+xml;utf8," +
                  encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0b1f3f"/><text x="24" y="32" font-family="Inter,Arial,sans-serif" font-size="24" font-weight="800" fill="#00aeef" text-anchor="middle">F</text></svg>',
                  ),
                height: 38,
                width: 38,
                excavate: true,
              }}
            />
            <span className="wapp-qr__caption">{accountNumber}</span>
          </div>

          <div className="wapp-receive__lines">
            <button
              type="button"
              className="wapp-account-line"
              onClick={() => copy(accountNumber, "acc")}
            >
              <span>{accountNumber}</span>
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
            onClick={() => copy(`FastPay · ${accountNumber}`, "share")}
          >
            <Share2 size={16} />
            {copied === "share" ? "Copied share text" : "Copy share text"}
          </button>
        </section>
      </div>
    </div>
  );
}
