import { useEffect, useState } from "react";
import {
  createMerchantInvoice,
  fetchMerchantInvoices,
  formatRwf,
  type MerchantInvoice,
} from "../../lib/merchant-api";

export function MerchantInvoicesPage() {
  const [invoices, setInvoices] = useState<MerchantInvoice[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const list = await fetchMerchantInvoices();
    setInvoices(list);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Failed to load invoices"));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const numeric = Number(amount.replace(/[^\d]/g, ""));
    if (!numeric || numeric < 100) {
      setError("Amount must be at least RWF 100.");
      return;
    }
    setBusy(true);
    try {
      await createMerchantInvoice({ amountRwf: numeric, description: description.trim() || undefined });
      setAmount("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create invoice");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="merchant-page">
      <header className="merchant-page__head">
        <div>
          <h1>Invoices</h1>
          <p className="merchant-page__sub">Create payable invoices for in-store or remote checkout.</p>
        </div>
      </header>

      <div className="merchant-grid-2">
        <section className="wapp-card wapp-form-card">
          <header className="wapp-card__head">
            <h2>New invoice</h2>
          </header>
          <form className="settings-form" onSubmit={handleCreate}>
            {error && <p className="auth-form__error">{error}</p>}
            <label>
              <span>Amount (RWF)</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} />
            </label>
            <label>
              <span>Description</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Table 4, order #882" />
            </label>
            <button type="submit" className="auth-form__submit" disabled={busy}>
              {busy ? "Creating…" : "Create invoice"}
            </button>
          </form>
        </section>

        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Recent invoices</h2>
          </header>
          <ul className="wapp-tx-list">
            {invoices.map((inv) => (
              <li key={inv.id}>
                <div>
                  <strong>{inv.invoiceNumber}</strong>
                  <small>{formatRwf(inv.amountRwf)} · {inv.status}</small>
                </div>
                <span>{inv.description ?? inv.merchantCode}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
