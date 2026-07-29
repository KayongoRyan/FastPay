import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { MerchantAuthVisual } from "../../components/MerchantAuthVisual";
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/merchant" replace />;
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
    <main className="auth-page">
      <MerchantAuthVisual mode={mode} />

      <section className="auth-form-wrap">
        <header className="auth-form-wrap__head">
          <h2>{mode === "login" ? "Merchant sign in" : "Register your business"}</h2>
          <p>
            {mode === "login" ? (
              <>
                New business?{" "}
                <button type="button" className="auth-form-wrap__link" onClick={() => setMode("register")}>
                  Create an account
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
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
              </label>
              <label>
                <span>Business name</span>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  autoComplete="organization"
                />
              </label>
              <label>
                <span>Business email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>
            </>
          )}

          {mode === "login" && (
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
          )}

          <label>
            <span>Password</span>
            <div className="auth-form__password">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
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

          <button type="submit" className="auth-form__submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create merchant account"}
          </button>
        </form>

        <p className="auth-form-wrap__foot">
          Consumer wallet? <Link to="/login">Personal sign in</Link>
        </p>
      </section>
    </main>
  );
}
