from __future__ import annotations

from pydantic import BaseModel


class ResourceCreate(BaseModel):
    organization_id: int
    name: str
    type: str | None = None
    capacity: int | None = None


class ResourceUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    capacity: int | None = None


class ResourceOut(BaseModel):
    id: int
    organization_id: int
    name: str
    type: str | None = None
    capacity: int | None = None

    class Config:
        from_attributes = True
