import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMerchantAuth } from "../../context/MerchantAuthContext";
import { fetchMerchantDashboard, formatRwf } from "../../lib/merchant-api";

export function MerchantDashboardPage() {
  const { user } = useMerchantAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchMerchantDashboard>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMerchantDashboard()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"));
  }, []);

  return (
    <div className="merchant-page">
      <header className="merchant-page__head">
        <div>
          <p className="merchant-page__eyebrow">Merchant dashboard</p>
          <h1>{user?.businessName ?? "Your business"}</h1>
          <p className="merchant-page__sub">
            Code <strong>{user?.merchantCode ?? data?.org.merchantCode ?? "—"}</strong> · consumers pay you via Bank Pay using this code
          </p>
        </div>
        <Link to="/merchant/invoices" className="btn-primary-navy">
          Create invoice
        </Link>
      </header>

      {error && <p className="auth-form__error">{error}</p>}

      <div className="merchant-stats">
        <article className="merchant-stat">
          <span>Today</span>
          <strong>{formatRwf(data?.todayTotalRwf ?? 0)}</strong>
          <small>{data?.todayCount ?? 0} payments</small>
        </article>
        <article className="merchant-stat">
          <span>Total received</span>
          <strong>{formatRwf(data?.totalReceivedRwf ?? 0)}</strong>
          <small>All time</small>
        </article>
        <article className="merchant-stat">
          <span>Open invoices</span>
          <strong>{data?.openInvoices ?? 0}</strong>
          <small>Awaiting payment</small>
        </article>
      </div>

      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>Recent payments</h2>
        </header>
        {!data?.recentTransactions.length ? (
          <p className="wapp-form-card__hint">No payments yet. Share your merchant code with customers.</p>
        ) : (
          <ul className="wapp-tx-list">
            {data.recentTransactions.map((tx) => (
              <li key={tx.id}>
                <div>
                  <strong>{formatRwf(tx.amountRwf)}</strong>
                  <small>{tx.channel.replace("_", " ")}</small>
                </div>
                <span>{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ""}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
