from __future__ import annotations

from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceUpdate
from sqlalchemy import select
from sqlalchemy.orm import Session


def create_resource(db: Session, data: ResourceCreate) -> Resource:
    obj = Resource(
        organization_id=data.organization_id,
        name=data.name,
        type=data.type,
        capacity=data.capacity,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_resource(db: Session, resource_id: int) -> Resource | None:
    return db.get(Resource, resource_id)


def list_resources(db: Session, organization_id: int | None = None) -> list[Resource]:
    stmt = select(Resource)
    if organization_id is not None:
        stmt = stmt.where(Resource.organization_id == organization_id)
    return list(db.execute(stmt).scalars().all())


def update_resource(db: Session, resource: Resource, data: ResourceUpdate) -> Resource:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(resource, field, value)
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


def delete_resource(db: Session, resource: Resource) -> None:
    db.delete(resource)
    db.commit()
