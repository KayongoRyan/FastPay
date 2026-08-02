import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { MerchantAuthVisual } from "../../components/MerchantAuthVisual";
import { useMerchantAuth } from "../../context/MerchantAuthContext";
import { loginMerchant, registerMerchant } from "../../lib/merchant-api";
import {
  BUSINESS_TYPE_OPTIONS,
  type BusinessType,
  businessTypeLabel,
} from "../../lib/business-types";

const STEPS = ["Type", "Shop details", "Account"] as const;

export function MerchantLoginPage() {
  const { setSession, isAuthenticated } = useMerchantAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState(0);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<BusinessType | "">("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [taxId, setTaxId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/merchant" replace />;
  }

  function switchMode(next: "login" | "register") {
    setMode(next);
    setStep(0);
    setError(null);
  }

  function validateStep(): string | null {
    if (step === 0 && !category) return "Pick your shop type to continue.";
    if (step === 1) {
      if (!businessName.trim()) return "Business name is required.";
      if (!address.trim()) return "Shop address is required.";
      if (!city.trim()) return "City is required.";
    }
    if (step === 2) {
      if (!fullName.trim()) return "Your name is required.";
      if (!email.trim() && !phone.trim()) return "Email or phone is required.";
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
        const res = await loginMerchant(identifier.trim(), password);
        if (res.user.accountType !== "merchant") {
          throw new Error("This account is a consumer wallet. Use /login for personal banking.");
        }
        setSession(res.user, res.tokens);
      } else {
        const res = await registerMerchant({
          fullName: fullName.trim(),
          password,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          businessName: businessName.trim(),
          category: category as BusinessType,
          businessEmail: email.trim() || undefined,
          businessPhone: businessPhone.trim() || phone.trim() || undefined,
          address: address.trim(),
          city: city.trim(),
          taxId: taxId.trim() || undefined,
        });
        setSession(res.user, res.tokens);
      }
      navigate("/merchant");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <MerchantAuthVisual mode={mode} />

      <section className="auth-form-wrap">
        <header className="auth-form-wrap__head">
          <h2>{mode === "login" ? "Merchant sign in" : "Register your business"}</h2>
          <p>
            {mode === "login" ? (
              <>
                New business?{" "}
                <button type="button" className="auth-form-wrap__link" onClick={() => switchMode("register")}>
                  Create an account
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
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="you@business.com"
                />
              </label>
              <label>
                <span>Password</span>
                <div className="auth-form__password">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-form__toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            </>
          )}

          {mode === "register" && step === 0 && (
            <fieldset className="biz-type-field">
              <legend>What type of shop is this?</legend>
              <div className="biz-type-grid">
                {BUSINESS_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`biz-type-card${category === opt.value ? " is-selected" : ""}`}
                    onClick={() => {
                      setCategory(opt.value);
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
                Registering a <strong>{businessTypeLabel(category)}</strong>
              </p>
              <label>
                <span>Business / shop name</span>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  autoComplete="organization"
                />
              </label>
              <label>
                <span>Shop phone</span>
                <input
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="+250…"
                  autoComplete="tel"
                />
              </label>
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
                  <span>TIN (optional)</span>
                  <input value={taxId} onChange={(e) => setTaxId(e.target.value)} />
                </label>
              </div>
            </>
          )}

          {mode === "register" && step === 2 && (
            <>
              <label>
                <span>Your name</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </label>
              <div className="auth-form__row">
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </label>
                <label>
                  <span>Phone</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="+250…"
                  />
                </label>
              </div>
              <label>
                <span>Password</span>
                <div className="auth-form__password">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-form__toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
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
                    : "Create merchant account"}
            </button>
          </div>
        </form>

        <p className="auth-form-wrap__foot">
          Company HQ? <Link to="/business/login">Business portal</Link>
          {" · "}
          Consumer wallet? <Link to="/login">Personal sign in</Link>
        </p>
      </section>
    </main>
  );
}
