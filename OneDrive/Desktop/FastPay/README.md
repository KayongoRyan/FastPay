FastPay Payment Gateway

A full-stack payment gateway supporting international transfers with React frontend, Node.js backend, MySQL database, and integrations with Stripe and PayPal.

Features
- Web and mobile support (web focused first)
- International currency support (USD, EUR, GBP)
- Stripe and PayPal payment methods
- MySQL database for user and payment data

Setup

Backend
1. Navigate to backend/ directory
2. Install dependencies: npm install
3. Set up environment variables in .env file
4. Run the server: node server.js

Frontend
1. Navigate to frontend/fastpay-web/
2. Install dependencies: npm install
3. Start the app: npm start

Database
1. Set up MySQL database
2. Run the schema from database/schema.sql

API Endpoints
- POST /api/payment/stripe - Process Stripe payment
- POST /api/payment/paypal - Process PayPal payment

Environment Variables
- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
- STRIPE_SECRET_KEY
- PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
