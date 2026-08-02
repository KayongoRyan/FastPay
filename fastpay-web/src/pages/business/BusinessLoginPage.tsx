import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useBusinessAuth } from "../../context/BusinessAuthContext";
import { loginBusiness, registerBusiness } from "../../lib/business-api";
import {
  BUSINESS_TYPE_OPTIONS,
  COUNTRY_OPTIONS,
  type BusinessType,
  businessTypeLabel,
} from "../../lib/business-types";

const STEPS = ["Type", "Company", "Location", "Account"] as const;

export function BusinessLoginPage() {
  const { setSession, isAuthenticated } = useBusinessAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState(0);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [businessType, setBusinessType] = useState<BusinessType | "">("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [taxId, setTaxId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("RW");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedType = useMemo(
    () => BUSINESS_TYPE_OPTIONS.find((o) => o.value === businessType),
    [businessType],
  );

  if (isAuthenticated) {
    return <Navigate to="/business" replace />;
  }

  function switchMode(next: "login" | "register") {
    setMode(next);
    setStep(0);
    setError(null);
  }

  function validateStep(): string | null {
    if (step === 0 && !businessType) return "Pick a business type to continue.";
    if (step === 1) {
      if (!companyName.trim()) return "Company name is required.";
      if (businessType === "other" && !industry.trim()) {
        return "Describe your industry when type is Other.";
      }
    }
    if (step === 2) {
      if (!companyEmail.trim() && !companyPhone.trim()) {
        return "Add a company email or phone.";
      }
      if (!address.trim()) return "Business address is required.";
      if (!city.trim()) return "City is required.";
    }
    if (step === 3) {
      if (!fullName.trim()) return "Your name is required.";
      if (!email.trim() && !phone.trim()) return "Account email or phone is required.";
      if (password.length < 8) return "Password must be at least 8 characters.";
    }
    return null;
  }

  function goNext() {
    const msg = validateStep();
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "register" && step < STEPS.length - 1) {
      goNext();
      return;
    }

    if (mode === "register") {
      const msg = validateStep();
      if (msg) {
        setError(msg);
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "login") {
        const res = await loginBusiness(identifier.trim(), password);
        if (res.user.accountType !== "business") {
          throw new Error("This account is not a business HQ login. Use merchant or personal sign-in.");
        }
        setSession(res.user, res.tokens);
      } else {
        const res = await registerBusiness({
          fullName: fullName.trim(),
          password,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          companyName: companyName.trim(),
          businessType: businessType as BusinessType,
          industry:
            industry.trim() ||
            (businessType ? businessTypeLabel(businessType) : undefined),
          companyEmail: companyEmail.trim() || email.trim() || undefined,
          companyPhone: companyPhone.trim() || phone.trim() || undefined,
          address: address.trim(),
          city: city.trim(),
          country,
          taxId: taxId.trim() || undefined,
          registrationNumber: registrationNumber.trim() || undefined,
          website: website.trim() || undefined,
          description: description.trim() || undefined,
        });
        setSession(res.user, res.tokens);
      }
      navigate("/business");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <aside className="auth-panel auth-visual--business">
        <div className="auth-panel__copy-block">
          <p className="auth-panel__eyebrow">Business HQ</p>
          <h1 className="auth-panel__title">
            Register the company
            <br />
            behind your shops.
          </h1>
          <p className="auth-panel__copy">
            Tell us what you run — retail, garage, construction, and more — then complete legal and
            contact details so branches can link under one HQ.
          </p>
        </div>
      </aside>

      <section className="auth-form-wrap">
        <header className="auth-form-wrap__head">
          <h2>{mode === "login" ? "Business sign in" : "Register your company"}</h2>
          <p>
            {mode === "login" ? (
              <>
                New company?{" "}
                <button type="button" className="auth-form-wrap__link" onClick={() => switchMode("register")}>
                  Create HQ account
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button type="button" className="auth-form-wrap__link" onClick={() => switchMode("login")}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </header>

        {mode === "register" && (
          <ol className="biz-reg-steps" aria-label="Registration steps">
            {STEPS.map((label, i) => (
              <li key={label} className={i === step ? "is-active" : i < step ? "is-done" : undefined}>
                <span className="biz-reg-steps__n">{i + 1}</span>
                <span className="biz-reg-steps__label">{label}</span>
              </li>
            ))}
          </ol>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <p className="auth-form__error" role="alert">
              {error}
            </p>
          )}

          {mode === "login" && (
            <>
              <label>
                <span>Email or phone</span>
                <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </label>
            </>
          )}

          {mode === "register" && step === 0 && (
            <fieldset className="biz-type-field">
              <legend>What kind of business is this?</legend>
              <div className="biz-type-grid">
                {BUSINESS_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`biz-type-card${businessType === opt.value ? " is-selected" : ""}`}
                    onClick={() => {
                      setBusinessType(opt.value);
                      setError(null);
                    }}
                  >
                    <strong>{opt.label}</strong>
                    <span>{opt.hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {mode === "register" && step === 1 && (
            <>
              <p className="biz-reg-hint">
                Registering as <strong>{selectedType?.label ?? "business"}</strong>
              </p>
              <label>
                <span>Company / trading name</span>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  autoComplete="organization"
                />
              </label>
              {(businessType === "other" || businessType === "professional_services") && (
                <label>
                  <span>{businessType === "other" ? "Describe your industry" : "Specialty (optional)"}</span>
                  <input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder={businessType === "other" ? "e.g. Printing press" : "e.g. Tax advisory"}
                    required={businessType === "other"}
                  />
                </label>
              )}
              <div className="auth-form__row">
                <label>
                  <span>TIN / tax ID</span>
                  <input
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="Optional"
                    autoComplete="off"
                  />
                </label>
                <label>
                  <span>Company reg. no.</span>
                  <input
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="RDB / reg. number"
                    autoComplete="off"
                  />
                </label>
              </div>
              <label>
                <span>Website (optional)</span>
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                  inputMode="url"
                />
              </label>
              <label>
                <span>Short description (optional)</span>
                <textarea
                  className="auth-form__textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What does the company do?"
                />
              </label>
            </>
          )}

          {mode === "register" && step === 2 && (
            <>
              <div className="auth-form__row">
                <label>
                  <span>Company email</span>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    autoComplete="organization-email"
                  />
                </label>
                <label>
                  <span>Company phone</span>
                  <input
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="+250…"
                    autoComplete="tel"
                  />
                </label>
              </div>
              <label>
                <span>Street address</span>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  autoComplete="street-address"
                />
              </label>
              <div className="auth-form__row">
                <label>
                  <span>City</span>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    autoComplete="address-level2"
                  />
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
            </>
          )}

          {mode === "register" && step === 3 && (
            <>
              <label>
                <span>Your name (owner / admin)</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </label>
              <div className="auth-form__row">
                <label>
                  <span>Login email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder={companyEmail || "you@company.com"}
                  />
                </label>
                <label>
                  <span>Login phone</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder={companyPhone || "+250…"}
                  />
                </label>
              </div>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
              <p className="auth-form__legal">
                Creating an HQ account for <strong>{companyName || "your company"}</strong> (
                {businessTypeLabel(businessType)}). You can add merchant branches after signup.
              </p>
            </>
          )}

          <div className={`auth-form__actions${mode === "register" && step > 0 ? " auth-form__actions--split" : ""}`}>
            {mode === "register" && step > 0 && (
              <button type="button" className="auth-form__ghost" onClick={goBack} disabled={busy}>
                Back
              </button>
            )}
            <button type="submit" className="auth-form__submit" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : step < STEPS.length - 1
                    ? "Continue"
                    : "Create business account"}
            </button>
          </div>
        </form>

        <p className="auth-form-wrap__foot">
          Shop till? <Link to="/merchant/login">Merchant portal</Link>
          {" · "}
          Personal wallet? <Link to="/login">Consumer sign in</Link>
        </p>
      </section>
    </main>
  );
}
