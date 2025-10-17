import sys
from pathlib import Path

# Ensure 'backend' directory is on sys.path so 'app' package is importable
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import os  # noqa: E402

import pytest  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app.db.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models import organization, reservation, resource, user  # noqa: E402


@pytest.fixture(scope="session")
def test_db_url(tmp_path_factory):
    # Use a temp SQLite file per test session
    db_dir = tmp_path_factory.mktemp("db")
    db_path = db_dir / "test.db"
    return f"sqlite:///{db_path}"

@pytest.fixture(scope="session")
def engine(test_db_url):
    engine = create_engine(test_db_url, future=True)
    # Create all tables
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()

@pytest.fixture(scope="session")
def TestingSessionLocal(engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

@pytest.fixture()
def db_session(TestingSessionLocal):
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture()
def client(TestingSessionLocal):
    from starlette.testclient import TestClient

    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    # Override dependency before creating TestClient
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    # Clean up override
    app.dependency_overrides.pop(get_db, None)
