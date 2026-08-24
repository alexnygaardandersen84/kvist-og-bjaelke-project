import sqlite3

from fastapi.testclient import TestClient

from app.main import app


def test_register_and_login(tmp_path, monkeypatch):
    database_path = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_PATH", str(database_path))

    with TestClient(app) as client:
        created = client.post(
            "/register",
            json={
                "username": "ada",
                "email": "ada@example.com",
                "password": "meget-hemmeligt",
            },
        )
        assert created.status_code == 201
        assert created.json()["username"] == "ada"
        assert "password" not in created.json()
        assert "created_at" not in created.json()
        assert "updated_at" not in created.json()

        logged_in = client.post(
            "/login",
            json={"username": "ada", "password": "meget-hemmeligt"},
        )
        assert logged_in.status_code == 200
        assert logged_in.json()["username"] == "ada"
        assert "password" not in logged_in.json()

        rejected = client.post(
            "/login",
            json={"password": "meget-hemmeligt"},
        )
        assert rejected.status_code == 422


def test_password_is_stored_in_clear_text(tmp_path, monkeypatch):
    database_path = tmp_path / "hash.db"
    monkeypatch.setenv("DATABASE_PATH", str(database_path))
    password = "ikke-i-klartekst"

    with TestClient(app) as client:
        response = client.post(
            "/register",
            json={
                "username": "grace",
                "email": "grace@example.com",
                "password": password,
            },
        )
        assert response.status_code == 201

    with sqlite3.connect(database_path) as connection:
        stored_password = connection.execute(
            "SELECT password FROM users WHERE username = 'grace'"
        ).fetchone()[0]
        columns = {
            row[1] for row in connection.execute("PRAGMA table_info(users)").fetchall()
        }
    assert stored_password == password
    assert "password" in columns
    assert "password_hash" not in columns
    assert "created_at" not in columns
    assert "updated_at" not in columns


def test_removes_timestamps_from_existing_database(tmp_path, monkeypatch):
    database_path = tmp_path / "legacy.db"
    monkeypatch.setenv("DATABASE_PATH", str(database_path))

    with sqlite3.connect(database_path) as connection:
        connection.execute(
            """
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE COLLATE NOCASE,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.execute(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            ("legacy", "legacy@example.com", "password123"),
        )

    with TestClient(app) as client:
        response = client.post(
            "/login",
            json={"username": "legacy", "password": "password123"},
        )

    assert response.status_code == 200
    with sqlite3.connect(database_path) as connection:
        columns = {
            row[1] for row in connection.execute("PRAGMA table_info(users)").fetchall()
        }
    assert "created_at" not in columns
    assert "updated_at" not in columns


def test_duplicate_email_returns_conflict(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "duplicates.db"))
    payload = {
        "username": "first",
        "email": "same@example.com",
        "password": "password123",
    }

    with TestClient(app) as client:
        assert client.post("/register", json=payload).status_code == 201
        payload["username"] = "second"
        response = client.post("/register", json=payload)

    assert response.status_code == 409


def test_wrong_login_returns_unauthorized(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "login.db"))

    with TestClient(app) as client:
        client.post(
            "/register",
            json={
                "username": "ada",
                "email": "ada@example.com",
                "password": "meget-hemmeligt",
            },
        )
        response = client.post(
            "/login", json={"username": "ada", "password": "forkert-password"}
        )

    assert response.status_code == 401
    assert response.json()["detail"] == "Forkert brugernavn eller password"
