const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL connected');
});

paypal.configure({
  'mode': 'sandbox',
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

app.post('/api/payment/stripe', async (req, res) => {
  const { amount, currency, paymentMethodId } = req.body;
  setTimeout(() => {
    res.json({ success: true, paymentIntent: { id: 'pi_mock_' + Date.now(), status: 'succeeded' } });
  }, 1000);
});

app.post('/api/payment/paypal', (req, res) => {
  const { amount, currency } = req.body;
  setTimeout(() => {
    res.json({ success: true, payment: { id: 'PAY_mock_' + Date.now(), state: 'created', links: [{ href: 'http://localhost:5000/api/payment/paypal', rel: 'self' }, { href: 'http://localhost:3000/success', rel: 'approval_url' }] } });
  }, 1000);
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
