
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.resource import ResourceCreate, ResourceOut, ResourceUpdate
from app.services import resource_service

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.post("/", response_model=ResourceOut, status_code=201)
def create_resource(data: ResourceCreate, db: Session = Depends(get_db)):
    return resource_service.create_resource(db, data)


@router.get("/{resource_id}", response_model=ResourceOut)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    obj = resource_service.get_resource(db, resource_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Resource not found")
    return obj


@router.get("/", response_model=list[ResourceOut])
def list_resources(
    organization_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return resource_service.list_resources(db, organization_id=organization_id)


@router.patch("/{resource_id}", response_model=ResourceOut)
def update_resource(resource_id: int, data: ResourceUpdate, db: Session = Depends(get_db)):
    obj = resource_service.get_resource(db, resource_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource_service.update_resource(db, obj, data)


@router.delete("/{resource_id}", status_code=204)
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    obj = resource_service.get_resource(db, resource_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Resource not found")
    resource_service.delete_resource(db, obj)
    return None
