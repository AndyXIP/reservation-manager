from __future__ import annotations

from app.models.organization import Organization
from app.schemas.organization import OrganizationCreate, OrganizationUpdate
from sqlalchemy import select
from sqlalchemy.orm import Session


def create_organization(db: Session, data: OrganizationCreate) -> Organization:
    obj = Organization(name=data.name)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def list_organizations(db: Session) -> list[Organization]:
    return list(db.execute(select(Organization)).scalars().all())


def get_organization(db: Session, org_id: int) -> Organization | None:
    return db.get(Organization, org_id)


def update_organization(db: Session, org: Organization, data: OrganizationUpdate) -> Organization:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(org, field, value)
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


def delete_organization(db: Session, org: Organization) -> None:
    db.delete(org)
    db.commit()
