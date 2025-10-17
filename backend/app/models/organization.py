from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from app.db.database import Base
from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .resource import Resource
    from .user import User


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    users: Mapped[list["User"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
    resources: Mapped[list["Resource"]] = relationship(
        back_populates="organization", cascade="all, delete-orphan"
    )
