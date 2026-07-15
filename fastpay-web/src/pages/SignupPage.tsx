import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthWalletVisual } from "../components/AuthWalletVisual";
import { useAuth } from "../context/AuthContext";
import { registerRequest } from "../lib/auth-api";

export function SignupPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const fullName = String(form.get("fullName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (!email && !phone) {
      setError("Add an email or a phone number.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = await registerRequest({
        fullName,
        password,
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
      });
      setSession(data);
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <AuthWalletVisual mode="signup" />

      <section className="auth-form-wrap">
        <header className="auth-form-wrap__head">
          <h2>Sign up</h2>
          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <p className="auth-form__error" role="alert">{error}</p>}

          <label>
            <span>Full name</span>
            <input
              type="text"
              name="fullName"
              required
              autoComplete="name"
              placeholder="Future Pluto"
            />
          </label>

          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@email.com"
            />
          </label>

          <label>
            <span>Phone (optional if email set)</span>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="+250 7XX XXX XXX"
            />
          </label>

          <div className="auth-form__row">
            <label>
              <span>Password</span>
              <div className="auth-form__password">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
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

            <label>
              <span>Confirm</span>
              <input
                type={showPassword ? "text" : "password"}
                name="confirm"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
          </div>

          <p className="auth-form__legal">
            By creating an account you agree to FastPay&apos;s terms and privacy
            notice.
          </p>

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
