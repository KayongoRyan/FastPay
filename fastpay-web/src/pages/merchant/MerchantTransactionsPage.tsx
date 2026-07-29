import { useEffect, useState } from "react";
import { fetchMerchantTransactions, formatRwf, type MerchantTransaction } from "../../lib/merchant-api";

export function MerchantTransactionsPage() {
  const [txs, setTxs] = useState<MerchantTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMerchantTransactions()
      .then(setTxs)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load transactions"));
  }, []);

  return (
    <div className="merchant-page">
      <header className="merchant-page__head">
        <h1>Transactions</h1>
        <p className="merchant-page__sub">All customer payments received by your business.</p>
      </header>

      {error && <p className="auth-form__error">{error}</p>}

      <section className="wapp-card">
        <ul className="wapp-tx-list">
          {txs.length === 0 ? (
            <li><span className="wapp-form-card__hint">No transactions yet.</span></li>
          ) : (
            txs.map((tx) => (
              <li key={tx.id}>
                <div>
                  <strong>{formatRwf(tx.amountRwf)}</strong>
                  <small>{tx.channel.replace("_", " ")} · {tx.status}</small>
                </div>
                <div className="merchant-tx-meta">
                  {tx.beneficiaryLabel && <span>{tx.beneficiaryLabel}</span>}
                  <span>{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ""}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
