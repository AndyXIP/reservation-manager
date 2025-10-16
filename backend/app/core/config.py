import os
from pathlib import Path


class Settings:
    """Application settings with sensible defaults and env overrides."""

    def __init__(self) -> None:
        # Resolve project directories
        current_file = Path(__file__).resolve()
        backend_dir = current_file.parents[2]  # .../backend

        # Database: default to SQLite file under backend/
        default_sqlite_path = backend_dir / "reservation.db"

        self.ENV: str = os.getenv("ENV", "development")
        self.DEBUG: bool = os.getenv("DEBUG", "false").lower() in {"1", "true", "yes", "y"}

        # If DATABASE_URL is provided, use it; otherwise, use sqlite path
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            self.DATABASE_URL: str = database_url
        else:
            # absolute file path to avoid CWD issues
            self.DATABASE_URL = f"sqlite:///{default_sqlite_path}"

        # Security (placeholders; can be overridden via env)
        self.SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
        self.ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


settings = Settings()
