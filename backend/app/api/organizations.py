from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.organization import OrganizationCreate, OrganizationUpdate, OrganizationOut
from app.services import organization_service


router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post("/", response_model=OrganizationOut, status_code=201)
def create_organization(data: OrganizationCreate, db: Session = Depends(get_db)):
    return organization_service.create_organization(db, data)


@router.get("/", response_model=list[OrganizationOut])
def list_organizations(db: Session = Depends(get_db)):
    return organization_service.list_organizations(db)


@router.get("/{org_id}", response_model=OrganizationOut)
def get_organization(org_id: int, db: Session = Depends(get_db)):
    obj = organization_service.get_organization(db, org_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Organization not found")
    return obj


@router.patch("/{org_id}", response_model=OrganizationOut)
def update_organization(org_id: int, data: OrganizationUpdate, db: Session = Depends(get_db)):
    obj = organization_service.get_organization(db, org_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Organization not found")
    return organization_service.update_organization(db, obj, data)


@router.delete("/{org_id}", status_code=204)
def delete_organization(org_id: int, db: Session = Depends(get_db)):
    obj = organization_service.get_organization(db, org_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Organization not found")
    organization_service.delete_organization(db, obj)
    return None
