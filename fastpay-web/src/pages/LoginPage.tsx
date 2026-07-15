import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthWalletVisual } from "../components/AuthWalletVisual";
import { useAuth } from "../context/AuthContext";
import { loginRequest } from "../lib/auth-api";

export function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const identifier = String(form.get("identifier") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      const data = await loginRequest(identifier, password);
      setSession(data);
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <AuthWalletVisual mode="login" />

      <section className="auth-form-wrap">
        <header className="auth-form-wrap__head">
          <h2>Log in</h2>
          <p>
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <p className="auth-form__error" role="alert">{error}</p>}

          <label>
            <span>Email or phone</span>
            <input
              type="text"
              name="identifier"
              required
              autoComplete="username"
              placeholder="you@email.com or +250…"
            />
          </label>

          <label>
            <span>Password</span>
            <div className="auth-form__password">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
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

          <div className="auth-form__meta">
            <Link to="/contact">Forgot password?</Link>
          </div>

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
