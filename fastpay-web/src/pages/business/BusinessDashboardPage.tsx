import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBusinessAuth } from "../../context/BusinessAuthContext";
import { fetchBusinessDashboard, formatRwf } from "../../lib/business-api";

export function BusinessDashboardPage() {
  const { user } = useBusinessAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchBusinessDashboard>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessDashboard()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"));
  }, []);

  return (
    <div className="merchant-page">
      <header className="merchant-page__head">
        <div>
          <p className="merchant-page__eyebrow">Business HQ</p>
          <h1>{user?.companyName ?? data?.org.companyName ?? "Your company"}</h1>
          <p className="merchant-page__sub">
            Code <strong>{user?.businessCode ?? data?.org.businessCode ?? "—"}</strong> · group view across merchant
            branches
          </p>
        </div>
        <Link to="/business/branches" className="btn-primary-navy">
          Manage branches
        </Link>
      </header>

      {error && <p className="auth-form__error">{error}</p>}

      <div className="merchant-stats merchant-stats--4">
        <article className="merchant-stat">
          <span>Branches</span>
          <strong>{data?.branchCount ?? 0}</strong>
          <small>{data?.activeBranches ?? 0} active</small>
        </article>
        <article className="merchant-stat">
          <span>Group received</span>
          <strong>{formatRwf(data?.totalReceivedRwf ?? 0)}</strong>
          <small>All linked shops</small>
        </article>
        <article className="merchant-stat">
          <span>Team</span>
          <strong>{data?.memberCount ?? 0}</strong>
          <small>HQ members</small>
        </article>
        <article className="merchant-stat">
          <span>Status</span>
          <strong>{data?.org.status ?? "—"}</strong>
          <small>Company account</small>
        </article>
      </div>

      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>Linked branches</h2>
        </header>
        {!data?.branches.length ? (
          <p className="wapp-form-card__hint">
            No branches yet. Create a shop under this company or link an existing merchant code you own.
          </p>
        ) : (
          <ul className="wapp-tx-list">
            {data.branches.map((b) => (
              <li key={b.orgId}>
                <div>
                  <strong>{b.businessName}</strong>
                  <small>
                    {b.merchantCode} · {b.status}
                    {b.category ? ` · ${b.category}` : ""}
                  </small>
                </div>
                <span>{formatRwf(b.totalReceivedRwf)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
