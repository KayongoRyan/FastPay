const crypto = require('crypto');
const http = require('http');
const { URL } = require('url');

const port = Number(process.env.PORT ?? 8090);
const accounts = new Map();

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function parseFormBody(raw) {
  return Object.fromEntries(new URLSearchParams(raw));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/') {
    return sendJson(res, 200, {
      _links: {
        self: { href: '/' },
        accounts: { href: '/accounts/{account_id}', templated: true },
        transactions: { href: '/transactions' },
        fee_stats: { href: '/fee_stats' },
      },
    });
  }

  if (req.method === 'GET' && url.pathname === '/fee_stats') {
    return sendJson(res, 200, {
      last_ledger: '12345',
      ledger_capacity_usage: '0.1',
      fee_charged: {
        max: '100',
        min: '100',
        mode: '100',
        p10: '100',
        p20: '100',
        p30: '100',
        p40: '100',
        p50: '100',
        p60: '100',
        p70: '100',
        p80: '100',
        p90: '100',
        p95: '100',
        p99: '100',
      },
    });
  }

  if (req.method === 'GET' && url.pathname.startsWith('/accounts/')) {
    const accountId = url.pathname.split('/accounts/')[1];
    const existing = accounts.get(accountId);
    const account =
      existing ??
      ({
        id: accountId,
        account_id: accountId,
        sequence: '1',
        subentry_count: 0,
        balances: [{ balance: '10000.0000000', asset_type: 'native' }],
        signers: [{ key: accountId, weight: 1, type: 'ed25519_public_key' }],
        thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
        flags: {
          auth_required: false,
          auth_revocable: false,
          auth_immutable: false,
        },
      });

    accounts.set(accountId, account);
    return sendJson(res, 200, account);
  }

  if (req.method === 'POST' && url.pathname === '/transactions') {
    const raw = await readBody(req);
    const parsed = parseFormBody(raw);
    const tx = parsed.tx ?? raw;
    const hash = crypto.randomBytes(32).toString('hex');

    return sendJson(res, 200, {
      hash,
      ledger: 12345,
      envelope_xdr: tx,
      result_xdr: 'AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAA=',
      result_meta_xdr: '',
    });
  }

  sendJson(res, 404, { detail: 'Not found' });
});

server.listen(port, () => {
  console.log(`Mock Horizon listening on http://0.0.0.0:${port}`);
});
