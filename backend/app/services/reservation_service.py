from __future__ import annotations

from datetime import datetime
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import Session

from app.models.reservation import Reservation
from app.schemas.reservation import ReservationCreate, ReservationUpdate


def has_conflict(db: Session, resource_id: int, start: datetime, end: datetime, exclude_id: int | None = None) -> bool:
    # Overlap if NOT (existing.end <= start OR existing.start >= end)
    stmt = select(Reservation).where(
        Reservation.resource_id == resource_id,
        or_(
            and_(Reservation.start_time < end, Reservation.end_time > start),
        ),
    )
    if exclude_id is not None:
        stmt = stmt.where(Reservation.id != exclude_id)
    return db.execute(stmt).scalars().first() is not None


def create_reservation(db: Session, data: ReservationCreate) -> Reservation:
    if data.end_time <= data.start_time:
        raise ValueError("end_time must be after start_time")
    if has_conflict(db, data.resource_id, data.start_time, data.end_time):
        raise ValueError("Reservation time conflicts with an existing reservation")

    obj = Reservation(
        resource_id=data.resource_id,
        user_id=data.user_id,
        start_time=data.start_time,
        end_time=data.end_time,
        notes=data.notes,
        guest_last_name=data.guest_last_name,
        guest_first_name=data.guest_first_name,
        guest_contact=data.guest_contact,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_reservation(db: Session, reservation_id: int) -> Reservation | None:
    return db.get(Reservation, reservation_id)


def list_reservations(
    db: Session,
    resource_id: int | None = None,
    user_id: int | None = None,
    start: datetime | None = None,
    end: datetime | None = None,
    guest_last_name: str | None = None,
) -> list[Reservation]:
    stmt = select(Reservation)
    if resource_id is not None:
        stmt = stmt.where(Reservation.resource_id == resource_id)
    if user_id is not None:
        stmt = stmt.where(Reservation.user_id == user_id)
    if start is not None:
        stmt = stmt.where(Reservation.end_time > start)
    if end is not None:
        stmt = stmt.where(Reservation.start_time < end)
    if guest_last_name is not None:
        stmt = stmt.where(Reservation.guest_last_name == guest_last_name)
    return list(db.execute(stmt).scalars().all())


def update_reservation(db: Session, reservation: Reservation, data: ReservationUpdate) -> Reservation:
    payload = data.model_dump(exclude_unset=True)
    new_start = payload.get("start_time", reservation.start_time)
    new_end = payload.get("end_time", reservation.end_time)
    if new_end <= new_start:
        raise ValueError("end_time must be after start_time")
    if has_conflict(db, reservation.resource_id, new_start, new_end, exclude_id=reservation.id):
        raise ValueError("Reservation time conflicts with an existing reservation")

    for field, value in payload.items():
        setattr(reservation, field, value)
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


def cancel_reservation(db: Session, reservation: Reservation) -> Reservation:
    reservation.status = "cancelled"
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


def delete_reservation(db: Session, reservation: Reservation) -> None:
    db.delete(reservation)
    db.commit()
