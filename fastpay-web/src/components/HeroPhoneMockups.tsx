function LineChart() {
  return (
    <svg className="hero-phone__line-chart" viewBox="0 0 200 60" aria-hidden="true">
      <defs>
        <linearGradient id="heroChartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00aeef" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00aeef" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 45 L25 38 L50 42 L75 28 L100 32 L125 18 L150 22 L175 10 L200 14"
        fill="none"
        stroke="#00aeef"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M0 45 L25 38 L50 42 L75 28 L100 32 L125 18 L150 22 L175 10 L200 14 L200 60 L0 60 Z"
        fill="url(#heroChartFill)"
      />
    </svg>
  );
}

function CandleChart() {
  const bars = [
    { x: 8, h: 28, up: true },
    { x: 20, h: 18, up: false },
    { x: 32, h: 34, up: true },
    { x: 44, h: 22, up: true },
    { x: 56, h: 16, up: false },
    { x: 68, h: 30, up: true },
    { x: 80, h: 20, up: false },
    { x: 92, h: 36, up: true },
    { x: 104, h: 24, up: true },
    { x: 116, h: 14, up: false },
    { x: 128, h: 32, up: true },
    { x: 140, h: 26, up: false },
    { x: 152, h: 38, up: true },
    { x: 164, h: 30, up: true },
    { x: 176, h: 20, up: false },
  ];

  return (
    <svg className="hero-phone__candle-chart" viewBox="0 0 190 50" aria-hidden="true">
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={50 - bar.h}
          width="8"
          height={bar.h}
          rx="1"
          fill={bar.up ? "#00aeef" : "#e85d5d"}
        />
      ))}
    </svg>
  );
}

const assets = [
  { symbol: "BTC", name: "Bitcoin", price: "$66,540", change: "+8.25%", up: true },
  { symbol: "ETH", name: "Ethereum", price: "$3,420", change: "+5.12%", up: true },
  { symbol: "SOL", name: "Solana", price: "$142.80", change: "-1.40%", up: false },
];

export function HeroPhoneMockups() {
  return (
    <div className="hero-phones" aria-hidden="true">
      <div className="hero-phones__orbit hero-phones__orbit--1" />
      <div className="hero-phones__orbit hero-phones__orbit--2" />
      <div className="hero-phones__orbit hero-phones__orbit--3" />

      <div className="hero-phones__coin hero-phones__coin--btc">
        <span>₿</span>
      </div>
      <div className="hero-phones__coin hero-phones__coin--eth">
        <span>Ξ</span>
      </div>

      <div className="hero-phone hero-phone--back">
        <div className="hero-phone__frame">
          <div className="hero-phone__notch" />
          <div className="hero-phone__screen hero-phone__screen--trade">
            <div className="hero-phone__trade-header">
              <div className="hero-phone__trade-coin">
                <span className="hero-phone__asset-icon hero-phone__asset-icon--btc">₿</span>
                <div>
                  <strong>Bitcoin</strong>
                  <span>BTC</span>
                </div>
              </div>
              <span className="hero-phone__trade-change hero-phone__trade-change--up">+8.25%</span>
            </div>
            <div className="hero-phone__trade-price">$66,540.80</div>
            <div className="hero-phone__trade-tabs">
              {["1H", "1D", "1W", "1M", "1Y"].map((t) => (
                <span key={t} className={t === "1D" ? "active" : ""}>
                  {t}
                </span>
              ))}
            </div>
            <CandleChart />
            <div className="hero-phone__trade-actions">
              <button type="button" className="hero-phone__btn-buy">
                Buy
              </button>
              <button type="button" className="hero-phone__btn-sell">
                Sell
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-phone hero-phone--front">
        <div className="hero-phone__frame">
          <div className="hero-phone__notch" />
          <div className="hero-phone__screen hero-phone__screen--home">
            <div className="hero-phone__status">
              <div className="hero-phone__avatar" />
              <div className="hero-phone__status-icons">
                <span />
                <span />
              </div>
            </div>
            <p className="hero-phone__label">Total Balance</p>
            <div className="hero-phone__balance">$32,850.75</div>
            <p className="hero-phone__delta hero-phone__delta--up">+12.5% (24h)</p>
            <div className="hero-phone__actions">
              <button type="button" className="hero-phone__btn-deposit">
                Deposit
              </button>
              <button type="button" className="hero-phone__btn-withdraw">
                Withdraw
              </button>
            </div>
            <div className="hero-phone__section-title">Portfolio Value</div>
            <LineChart />
            <div className="hero-phone__section-title">Top Assets</div>
            <ul className="hero-phone__assets">
              {assets.map((asset) => (
                <li key={asset.symbol} className="hero-phone__asset">
                  <span
                    className={`hero-phone__asset-icon hero-phone__asset-icon--${asset.symbol.toLowerCase()}`}
                  >
                    {asset.symbol === "BTC" ? "₿" : asset.symbol === "ETH" ? "Ξ" : "◎"}
                  </span>
                  <div className="hero-phone__asset-info">
                    <strong>{asset.name}</strong>
                    <span>{asset.symbol}</span>
                  </div>
                  <div className="hero-phone__asset-price">
                    <strong>{asset.price}</strong>
                    <span className={asset.up ? "up" : "down"}>{asset.change}</span>
                  </div>
                </li>
              ))}
            </ul>
            <nav className="hero-phone__nav">
              {["Home", "Markets", "Trade", "Wallet"].map((item) => (
                <span key={item} className={item === "Home" ? "active" : ""}>
                  <i />
                  {item}
                </span>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
