import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useBusinessAuth } from "../../context/BusinessAuthContext";
import { loginBusiness, registerBusiness } from "../../lib/business-api";

export function BusinessLoginPage() {
  const { setSession, isAuthenticated } = useBusinessAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/business" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
          companyName: companyName.trim(),
          industry: industry.trim() || undefined,
          companyEmail: email.trim() || undefined,
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
            Run the company
            <br />
            behind your shops.
          </h1>
          <p className="auth-panel__copy">
            Link merchant branches, invite finance &amp; admins, and see group revenue — separate from
            day-to-day till ops.
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
                <button type="button" className="auth-form-wrap__link" onClick={() => setMode("register")}>
                  Create HQ account
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button type="button" className="auth-form-wrap__link" onClick={() => setMode("login")}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <p className="auth-form__error" role="alert">
              {error}
            </p>
          )}

          {mode === "register" && (
            <>
              <label>
                <span>Your name</span>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </label>
              <label>
                <span>Company name</span>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </label>
              <label>
                <span>Work email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label>
                <span>Industry</span>
                <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Retail, hospitality…" />
              </label>
            </>
          )}

          {mode === "login" && (
            <label>
              <span>Email or phone</span>
              <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            </label>
          )}

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

          <button type="submit" className="auth-form__submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create business account"}
          </button>
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
