from __future__ import annotations

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.reservation import ReservationCreate, ReservationOut, ReservationUpdate
from app.services import reservation_service


router = APIRouter(prefix="/reservations", tags=["Reservations"])


@router.post("/", response_model=ReservationOut, status_code=201)
def create_reservation(data: ReservationCreate, db: Session = Depends(get_db)):
    try:
        return reservation_service.create_reservation(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{reservation_id}", response_model=ReservationOut)
def get_reservation(reservation_id: int, db: Session = Depends(get_db)):
    obj = reservation_service.get_reservation(db, reservation_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return obj


@router.get("/", response_model=list[ReservationOut])
def list_reservations(
    resource_id: int | None = Query(default=None),
    user_id: int | None = Query(default=None),
    start: datetime | None = Query(default=None),
    end: datetime | None = Query(default=None),
    guest_last_name: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return reservation_service.list_reservations(
        db, resource_id=resource_id, user_id=user_id, start=start, end=end, guest_last_name=guest_last_name
    )


@router.patch("/{reservation_id}", response_model=ReservationOut)
def update_reservation(reservation_id: int, data: ReservationUpdate, db: Session = Depends(get_db)):
    obj = reservation_service.get_reservation(db, reservation_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Reservation not found")
    try:
        return reservation_service.update_reservation(db, obj, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{reservation_id}/cancel", response_model=ReservationOut)
def cancel_reservation(reservation_id: int, db: Session = Depends(get_db)):
    obj = reservation_service.get_reservation(db, reservation_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation_service.cancel_reservation(db, obj)


@router.delete("/{reservation_id}", status_code=204)
def delete_reservation(reservation_id: int, db: Session = Depends(get_db)):
    obj = reservation_service.get_reservation(db, reservation_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Reservation not found")
    reservation_service.delete_reservation(db, obj)
    return None
