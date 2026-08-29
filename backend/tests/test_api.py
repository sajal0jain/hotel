import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal, Base, engine
from backend.seed import seed_database
from backend.models import Room, Expense, RateRecommendation

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

@pytest.fixture
def client():
    return TestClient(app)

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["total_rooms"] == 40

def test_auth_login_success(client):
    response = client.post("/api/auth/login", json={
        "email": "owner@grandheritage.com",
        "password": "heritage2026"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "owner"

def test_auth_login_failure(client):
    response = client.post("/api/auth/login", json={
        "email": "owner@grandheritage.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_get_rooms_and_count(client):
    response = client.get("/api/operations/rooms")
    assert response.status_code == 200
    rooms = response.json()
    assert len(rooms) == 40
    # Test room status update
    room_101 = rooms[0]
    update_res = client.put(f"/api/operations/rooms/{room_101['id']}/status", json={
        "status": "clean"
    })
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "clean"

def test_whatsapp_simulator_faq(client):
    response = client.post("/api/concierge/simulator", json={
        "phone": "+919800011122",
        "name": "Arjun Malhotra",
        "message": "What is the Wi-Fi password and what time is breakfast?"
    })
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "Heritage_Guest_5G" in data["reply"] or "wifi" in data["reply"].lower()
    assert data["escalated"] is False

def test_whatsapp_simulator_escalation(client):
    response = client.post("/api/concierge/simulator", json={
        "phone": "+919800011122",
        "name": "Arjun Malhotra",
        "message": "The AC in my room is completely broken and leaking water on the bed! Unacceptable!",
        "room_number": "205"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["escalated"] is True
    assert "leak" in data["escalation_reason"].lower() or "keyword" in data["escalation_reason"].lower()

def test_dashboard_kpis(client):
    response = client.get("/api/analytics/dashboard-kpis")
    assert response.status_code == 200
    data = response.json()
    assert data["total_rooms"] == 40
    assert "occupancy_rate" in data
    assert "today_revenue" in data
    assert "adr" in data

def test_daily_ai_report(client):
    response = client.get("/api/analytics/daily-report")
    assert response.status_code == 200
    data = response.json()
    assert "ai_suggested_action" in data
    assert len(data["key_highlights"]) > 0

def test_natural_language_qa(client):
    # Test OTA profitability question
    res1 = client.post("/api/analytics/ask-data", json={"query": "Which OTA is most profitable?"})
    assert res1.status_code == 200
    data1 = res1.json()
    assert "Direct" in data1["answer"] or "margin" in data1["answer"].lower()
    
    # Test Tuesday question
    res2 = client.post("/api/analytics/ask-data", json={"query": "Why is Tuesday occupancy low?"})
    assert res2.status_code == 200
    data2 = res2.json()
    assert "Tuesday" in data2["answer"] or "midweek" in data2["answer"].lower()

def test_expense_pnl_and_anomaly(client):
    response = client.get("/api/expenses/pnl/2026-08")
    assert response.status_code == 200
    pnl = response.json()
    assert "total_revenue" in pnl
    assert "total_expenses" in pnl
    assert "net_operating_income" in pnl
    assert "expenses_by_category" in pnl

def test_reviews_and_draft_response(client):
    # Get reviews
    reviews_res = client.get("/api/reviews")
    assert reviews_res.status_code == 200
    reviews = reviews_res.json()
    assert len(reviews) > 0

    first_rev = reviews[0]
    draft_res = client.post("/api/reviews/draft-response", json={
        "review_id": first_rev["id"],
        "custom_tone": "empathetic and professional"
    })
    assert draft_res.status_code == 200
    assert "response_draft" in draft_res.json()

def test_revenue_optimizer_recommendations(client):
    recs_res = client.get("/api/pricing/recommendations")
    assert recs_res.status_code == 200
    recs = recs_res.json()
    assert len(recs) == 14
    
    # Apply recommendation for first item
    first_rec = recs[0]
    apply_res = client.post(f"/api/pricing/apply/{first_rec['id']}")
    assert apply_res.status_code == 200
    assert apply_res.json()["applied"] is True
