import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMerchantAuth } from "../../context/MerchantAuthContext";
import { loginMerchant, registerMerchant } from "../../lib/merchant-api";

export function MerchantLoginPage() {
  const { setSession, isAuthenticated } = useMerchantAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    navigate("/merchant", { replace: true });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
          businessName: businessName.trim(),
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
    <div className="merchant-auth">
      <div className="merchant-auth__card">
        <p className="merchant-auth__eyebrow">FastPay Merchant</p>
        <h1>{mode === "login" ? "Sign in" : "Register your business"}</h1>
        <p className="merchant-auth__hint">
          Separate from consumer wallets — accept Bank Pay, invoices, and track settlements.
        </p>

        <form className="settings-form" onSubmit={handleSubmit}>
          {error && <p className="auth-form__error">{error}</p>}

          {mode === "register" && (
            <>
              <label>
                <span>Your name</span>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </label>
              <label>
                <span>Business name</span>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
              </label>
              <label>
                <span>Business email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </label>

          <button type="submit" className="auth-form__submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create merchant account"}
          </button>
        </form>

        <button
          type="button"
          className="btn-ghost-navy merchant-auth__switch"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "New business? Register" : "Already registered? Sign in"}
        </button>

        <p className="merchant-auth__footer">
          Consumer wallet? <Link to="/login">Personal sign in</Link>
        </p>
      </div>
    </div>
  );
}
