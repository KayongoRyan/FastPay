import { useEffect, useState } from "react";
import {
  createProduct,
  fetchInventorySummary,
  fetchProducts,
  fetchStockMovements,
  formatRwf,
  recordStockMovement,
  type MerchantProduct,
  type MerchantStockMovement,
} from "../../lib/merchant-api";

const MOVEMENT_TYPES: Array<{ value: MerchantStockMovement["type"]; label: string }> = [
  { value: "stock_in", label: "Stock in" },
  { value: "sale", label: "Sold / stock out" },
  { value: "return", label: "Customer return" },
  { value: "write_off", label: "Write-off / damage" },
  { value: "adjustment", label: "Adjustment (down)" },
];

export function MerchantInventoryPage() {
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [movements, setMovements] = useState<MerchantStockMovement[]>([]);
  const [summary, setSummary] = useState({
    skuCount: 0,
    outOfStock: 0,
    lowStock: 0,
    stockValueRwf: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("unit");
  const [stockQty, setStockQty] = useState("0");
  const [reorderLevel, setReorderLevel] = useState("5");
  const [costPrice, setCostPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  const [moveProductId, setMoveProductId] = useState("");
  const [moveType, setMoveType] = useState<MerchantStockMovement["type"]>("stock_in");
  const [moveQty, setMoveQty] = useState("1");
  const [moveNote, setMoveNote] = useState("");

  async function load() {
    const [list, moves, stats] = await Promise.all([
      fetchProducts(),
      fetchStockMovements(),
      fetchInventorySummary(),
    ]);
    setProducts(list);
    setMovements(moves);
    setSummary(stats);
    if (!moveProductId && list[0]) setMoveProductId(list[0].id);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Failed to load inventory"));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    setBusy(true);
    try {
      await createProduct({
        name: name.trim(),
        sku: sku.trim() || undefined,
        category: category.trim() || undefined,
        unit: unit.trim() || "unit",
        stockQty: Number(stockQty) || 0,
        reorderLevel: Number(reorderLevel) || 0,
        costPriceRwf: Number(costPrice) || 0,
        sellPriceRwf: Number(sellPrice) || 0,
      });
      setName("");
      setSku("");
      setCategory("");
      setStockQty("0");
      setCostPrice("");
      setSellPrice("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add product");
    } finally {
      setBusy(false);
    }
  }

  async function handleMovement(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const qty = Number(moveQty);
    if (!moveProductId) {
      setError("Pick a product.");
      return;
    }
    if (!qty || qty <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }
    setBusy(true);
    try {
      await recordStockMovement({
        productId: moveProductId,
        type: moveType,
        quantity: qty,
        note: moveNote.trim() || undefined,
      });
      setMoveQty("1");
      setMoveNote("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Stock update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="merchant-page">
      <header className="merchant-page__head">
        <div>
          <p className="merchant-page__eyebrow">Operations</p>
          <h1>Inventory</h1>
          <p className="merchant-page__sub">
            Track stocked-in items, sold-out SKUs, reorder levels, and stock movements.
          </p>
        </div>
      </header>

      {error && <p className="auth-form__error">{error}</p>}

      <div className="merchant-stats merchant-stats--4">
        <article className="merchant-stat">
          <span>SKUs</span>
          <strong>{summary.skuCount}</strong>
          <small>Active products</small>
        </article>
        <article className="merchant-stat">
          <span>Out of stock</span>
          <strong>{summary.outOfStock}</strong>
          <small>Sold out / zero</small>
        </article>
        <article className="merchant-stat">
          <span>Low stock</span>
          <strong>{summary.lowStock}</strong>
          <small>At or below reorder</small>
        </article>
        <article className="merchant-stat">
          <span>Stock value</span>
          <strong>{formatRwf(summary.stockValueRwf)}</strong>
          <small>At cost</small>
        </article>
      </div>

      <div className="merchant-grid-2">
        <section className="wapp-card wapp-form-card">
          <header className="wapp-card__head">
            <h2>Add product</h2>
          </header>
          <form className="settings-form" onSubmit={handleCreate}>
            <label>
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Rice 25kg" />
            </label>
            <label>
              <span>SKU</span>
              <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="RICE-25" />
            </label>
            <label>
              <span>Category</span>
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Groceries" />
            </label>
            <div className="merchant-form-row">
              <label>
                <span>Unit</span>
                <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="unit / kg / pack" />
              </label>
              <label>
                <span>Initial stock</span>
                <input value={stockQty} onChange={(e) => setStockQty(e.target.value.replace(/[^\d.]/g, ""))} />
              </label>
            </div>
            <div className="merchant-form-row">
              <label>
                <span>Reorder at</span>
                <input value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value.replace(/[^\d.]/g, ""))} />
              </label>
              <label>
                <span>Cost (RWF)</span>
                <input value={costPrice} onChange={(e) => setCostPrice(e.target.value.replace(/[^\d]/g, ""))} />
              </label>
            </div>
            <label>
              <span>Sell price (RWF)</span>
              <input value={sellPrice} onChange={(e) => setSellPrice(e.target.value.replace(/[^\d]/g, ""))} />
            </label>
            <button type="submit" className="auth-form__submit" disabled={busy}>
              {busy ? "Saving…" : "Add to inventory"}
            </button>
          </form>
        </section>

        <section className="wapp-card wapp-form-card">
          <header className="wapp-card__head">
            <h2>Stock movement</h2>
          </header>
          <form className="settings-form" onSubmit={handleMovement}>
            <label>
              <span>Product</span>
              <select value={moveProductId} onChange={(e) => setMoveProductId(e.target.value)}>
                {products.length === 0 && <option value="">No products yet</option>}
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.stockQty} {p.unit})
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Type</span>
              <select
                value={moveType}
                onChange={(e) => setMoveType(e.target.value as MerchantStockMovement["type"])}
              >
                {MOVEMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Quantity</span>
              <input value={moveQty} onChange={(e) => setMoveQty(e.target.value.replace(/[^\d.]/g, ""))} />
            </label>
            <label>
              <span>Note</span>
              <input value={moveNote} onChange={(e) => setMoveNote(e.target.value)} placeholder="Supplier delivery / till #2" />
            </label>
            <button type="submit" className="auth-form__submit" disabled={busy || products.length === 0}>
              {busy ? "Updating…" : "Record movement"}
            </button>
          </form>
        </section>
      </div>

      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>Catalog</h2>
        </header>
        {!products.length ? (
          <p className="wapp-form-card__hint">No products yet. Add your first SKU above.</p>
        ) : (
          <ul className="wapp-tx-list">
            {products.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>{p.name}</strong>
                  <small>
                    {p.sku ? `${p.sku} · ` : ""}
                    {p.category ?? "Uncategorized"} · sell {formatRwf(p.sellPriceRwf)}
                  </small>
                </div>
                <span className="merchant-pill-row">
                  <span className={`merchant-pill${p.status === "out_of_stock" ? " is-danger" : p.lowStock ? " is-warn" : ""}`}>
                    {p.stockQty} {p.unit}
                  </span>
                  {p.status === "out_of_stock" && <span className="merchant-pill is-danger">Sold out</span>}
                  {p.lowStock && <span className="merchant-pill is-warn">Low</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>Recent movements</h2>
        </header>
        {!movements.length ? (
          <p className="wapp-form-card__hint">Stock in / sales will show here.</p>
        ) : (
          <ul className="wapp-tx-list">
            {movements.map((m) => (
              <li key={m.id}>
                <div>
                  <strong>{m.productName ?? m.productId}</strong>
                  <small>
                    {m.type.replace("_", " ")} · after {m.quantityAfter}
                    {m.note ? ` · ${m.note}` : ""}
                  </small>
                </div>
                <span>
                  {m.quantityDelta > 0 ? "+" : ""}
                  {m.quantityDelta}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
