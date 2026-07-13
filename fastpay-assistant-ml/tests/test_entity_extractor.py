from fastpay_assistant.ml.entity_extractor import extract_entities


def test_amount_and_asset():
    e = extract_entities("can I afford 50,000 RWF in USDT")
    assert e.amount_rwf == 50000
    assert e.asset == "USDT"


def test_btc_and_transfer():
    e = extract_entities("transfer some bitcoin this month")
    assert e.asset == "BTC"
    assert e.action == "transfer"
    assert e.timeframe == "this month"


def test_loan_action():
    e = extract_entities("I want a loan of 100000")
    assert e.action == "loan"
    assert e.amount_rwf == 100000


def test_sol():
    e = extract_entities("check my solana")
    assert e.asset == "SOL"
