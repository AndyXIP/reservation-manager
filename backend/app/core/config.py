import os
from pathlib import Path

class Settings:
    def __init__(self):
        backend_dir = Path(__file__).resolve().parents[2]
        default_sqlite_path = backend_dir / "reservation.db"

        self.DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{default_sqlite_path}")

settings = Settings()