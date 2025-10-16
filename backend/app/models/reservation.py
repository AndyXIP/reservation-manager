from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from .resource import Resource
    from .user import User


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    resource_id: Mapped[int] = mapped_column(ForeignKey("resources.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)

    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="confirmed")  # pending|confirmed|cancelled
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Guest booking (no auth) fields
    guest_last_name: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    guest_first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    guest_contact: Mapped[str | None] = mapped_column(String(255), nullable=True)

    resource: Mapped["Resource"] = relationship(back_populates="reservations")
    user: Mapped["User" | None] = relationship(back_populates="reservations")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        # Useful index for lookups by last name + start time windows
        Index("ix_reservations_guest_last_name_start", "guest_last_name", "start_time"),
    )
