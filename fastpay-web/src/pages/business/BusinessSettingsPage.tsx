import { useEffect, useState } from "react";
import {
  fetchBusinessOrg,
  updateBusinessOrg,
  type BusinessOrg,
} from "../../lib/business-api";
import {
  BUSINESS_TYPE_OPTIONS,
  COUNTRY_OPTIONS,
  type BusinessType,
} from "../../lib/business-types";

export function BusinessSettingsPage() {
  const [org, setOrg] = useState<BusinessOrg | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | "">("");
  const [industry, setIndustry] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("RW");
  const [taxId, setTaxId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchBusinessOrg()
      .then((o) => {
        if (!o) return;
        setOrg(o);
        setCompanyName(o.companyName ?? "");
        setBusinessType((o.businessType as BusinessType) ?? "");
        setIndustry(o.industry ?? "");
        setCompanyEmail(o.companyEmail ?? "");
        setCompanyPhone(o.companyPhone ?? "");
        setAddress(o.address ?? "");
        setCity(o.city ?? "");
        setCountry(o.country ?? "RW");
        setTaxId(o.taxId ?? "");
        setRegistrationNumber(o.registrationNumber ?? "");
        setWebsite(o.website ?? "");
        setDescription(o.description ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    try {
      const updated = await updateBusinessOrg({
        companyName: companyName.trim(),
        businessType: businessType || undefined,
        industry: industry.trim() || undefined,
        companyEmail: companyEmail.trim() || undefined,
        companyPhone: companyPhone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        country,
        taxId: taxId.trim() || undefined,
        registrationNumber: registrationNumber.trim() || undefined,
        website: website.trim() || undefined,
        description: description.trim() || undefined,
      });
      setOrg(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="merchant-page">
      <header className="merchant-page__head">
        <div>
          <p className="merchant-page__eyebrow">Company</p>
          <h1>Settings</h1>
          <p className="merchant-page__sub">
            Business code <strong>{org?.businessCode ?? "—"}</strong>
          </p>
        </div>
      </header>

      <section className="wapp-card wapp-form-card">
        <header className="wapp-card__head">
          <h2>Profile</h2>
        </header>
        <form className="settings-form" onSubmit={handleSave}>
          {error && <p className="auth-form__error">{error}</p>}
          {saved && <p className="settings-note">Saved.</p>}
          <label>
            <span>Company name</span>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          </label>
          <label>
            <span>Business type</span>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value as BusinessType)}
              required
            >
              <option value="" disabled>
                Select type…
              </option>
              {BUSINESS_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Industry detail</span>
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Optional extra detail"
            />
          </label>
          <div className="settings-selects">
            <label>
              <span>TIN / tax ID</span>
              <input value={taxId} onChange={(e) => setTaxId(e.target.value)} />
            </label>
            <label>
              <span>Company reg. no.</span>
              <input
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />
            </label>
          </div>
          <label>
            <span>Email</span>
            <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
          </label>
          <label>
            <span>Phone</span>
            <input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
          </label>
          <label>
            <span>Address</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <div className="settings-selects">
            <label>
              <span>City</span>
              <input value={city} onChange={(e) => setCity(e.target.value)} />
            </label>
            <label>
              <span>Country</span>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>Website</span>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
          <label>
            <span>Description</span>
            <textarea
              className="auth-form__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>
          <button type="submit" className="auth-form__submit" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>
    </div>
  );
}
