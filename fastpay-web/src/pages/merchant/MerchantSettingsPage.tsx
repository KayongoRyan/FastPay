import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMerchantAuth } from "../../context/MerchantAuthContext";
import { fetchMerchantOrg, updateMerchantOrg } from "../../lib/merchant-api";

export function MerchantSettingsPage() {
  const { user } = useMerchantAuth();
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [category, setCategory] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [address, setAddress] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMerchantOrg()
      .then((org) => {
        if (!org) return;
        setBusinessName(org.businessName);
        setCategory(org.category ?? "");
        setBusinessPhone(org.businessPhone ?? "");
        setAddress(org.address ?? "");
      })
      .catch(() => undefined);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    try {
      await updateMerchantOrg({ businessName, category, businessPhone, address });
      setMsg("Business profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <div className="merchant-page">
      <header className="merchant-page__head">
        <h1>Settings</h1>
        <p className="merchant-page__sub">Merchant code <strong>{user?.merchantCode}</strong> cannot be changed.</p>
      </header>

      <section className="wapp-card wapp-form-card">
        <form className="settings-form" onSubmit={handleSave}>
          {msg && <p className="settings-note">{msg}</p>}
          {error && <p className="auth-form__error">{error}</p>}
          <label>
            <span>Business name</span>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </label>
          <label>
            <span>Category</span>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Retail, utilities, …" />
          </label>
          <label>
            <span>Business phone</span>
            <input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} />
          </label>
          <label>
            <span>Address</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <button type="submit" className="auth-form__submit">Save changes</button>
        </form>
      </section>

      <p className="merchant-page__sub">
        Need the consumer wallet instead? <Link to="/app">Go to FastPay wallet</Link>
      </p>
    </div>
  );
}
