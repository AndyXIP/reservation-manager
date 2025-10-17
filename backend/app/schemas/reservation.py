from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ReservationCreate(BaseModel):
    resource_id: int
    user_id: int | None = None
    start_time: datetime
    end_time: datetime
    notes: str | None = None
    guest_last_name: str | None = None
    guest_first_name: str | None = None
    guest_contact: str | None = None


class ReservationUpdate(BaseModel):
    start_time: datetime | None = None
    end_time: datetime | None = None
    status: str | None = None
    notes: str | None = None
    guest_last_name: str | None = None
    guest_first_name: str | None = None
    guest_contact: str | None = None


class ReservationOut(BaseModel):
    id: int
    resource_id: int
    user_id: int | None
    start_time: datetime
    end_time: datetime
    status: str
    notes: str | None
    guest_last_name: str | None
    guest_first_name: str | None
    guest_contact: str | None
    model_config = ConfigDict(from_attributes=True)
