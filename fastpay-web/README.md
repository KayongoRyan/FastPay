# FastPay Web

Marketing landing site for FastPay — follows the Finto fintech layout with the FastPay palette:

| Role | Color |
|------|-------|
| Aqua (accents, CTAs) | `#00AEEF` |
| Navy (dark sections) | `#0B1F3F` |
| Dark blue (depth, top bar, footer) | `#08182F` |

## Quick start

```bash
cd fastpay-web
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
npm run preview  # preview production build
```

## Sections

**Home** (`/`) — landing with hero, features, analytics preview, services, testimonials, pricing, FAQ

**Analytics** (`/analytics`) — budget demo (weekly/monthly/yearly), metrics, category breakdown, capabilities

**Services** (`/services`) — detailed service cards, how-it-works, business panel

**Pricing** (`/pricing`) — plan cards, feature comparison table, pricing FAQ

**Contact** (`/contact`) — contact form, support channels, global offices

## Stack

Vite + React + TypeScript, plain CSS (no UI framework).
