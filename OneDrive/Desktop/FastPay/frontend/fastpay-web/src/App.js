import React, { useState } from 'react';
import './App.css';

function App() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('usd');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    setIsProcessing(true);
    try {
      if (paymentMethod === 'stripe') {
        const response = await fetch('http://localhost:5000/api/payment/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amount * 100, currency, paymentMethodId: 'pm_card_visa' })
        });
        const data = await response.json();
        alert(data.success ? 'Payment successful!' : 'Payment failed: ' + data.error);
      } else if (paymentMethod === 'paypal') {
        const response = await fetch('http://localhost:5000/api/payment/paypal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, currency })
        });
        const data = await response.json();
        if (data.success) {
          const approvalLink = data.payment.links.find(link => link.rel === 'approval_url');
          if (approvalLink) {
            window.location.href = approvalLink.href;
          } else {
            alert('Payment created but no approval URL found.');
          }
        } else {
          alert('Payment failed: ' + data.error);
        }
      }
    } catch (error) {
      alert('An error occurred: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>FastPay</h1>
        <p>Secure and Fast International Payments</p>
      </header>
      <main className="main-content">
        <div className="payment-card">
          <h2>Make a Payment</h2>
          <form className="payment-form">
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="usd">USD - US Dollar</option>
                <option value="eur">EUR - Euro</option>
                <option value="gbp">GBP - British Pound</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="stripe">💳 Stripe</option>
                <option value="paypal">🅿️ PayPal</option>
              </select>
            </div>
            <button type="button" className="pay-button" onClick={handlePayment} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
          </form>
        </div>
      </main>
      <footer className="footer">
        <p>&copy; 2023 FastPay. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
