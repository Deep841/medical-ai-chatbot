import os

os.environ["TESTING"] = "1"
os.environ.setdefault("PINECONE_API_KEY", "test")
os.environ.setdefault("GITHUB_NEW_API_TOKEN", "test")

from app import app, is_medical_query


def test_health_endpoint():
    client = app.test_client()
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json["status"] == "ok"
    assert response.json["model"] == "gpt-4o-mini"


def test_non_medical_query_is_rejected():
    client = app.test_client()
    response = client.post("/api/get", data={"msg": "Tell me a joke", "session_id": "test-session"})

    assert response.status_code == 200
    assert "only answer medical" in response.json["answer"].lower()
    assert response.json["sources"] == []


def test_medical_query_returns_dummy_answer():
    client = app.test_client()
    response = client.post("/api/get", data={"msg": "What is asthma?", "session_id": "test-session"})

    assert response.status_code == 200
    assert response.json["answer"] == "This is a test answer from MediBot."
    assert response.json["sources"] == []


def test_is_medical_query():
    assert is_medical_query("What is hypertension?")
    assert not is_medical_query("What movies are playing?")


def test_twisted_medical_query_is_accepted():
    assert is_medical_query("What are the side effects of thyroid medication?")
    assert is_medical_query("Can thyroid issues cause fatigue and hair loss?")
    assert not is_medical_query("What is the weather forecast for tomorrow?")
