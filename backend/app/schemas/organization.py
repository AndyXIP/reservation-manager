from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class OrganizationCreate(BaseModel):
    name: str


class OrganizationUpdate(BaseModel):
    name: str | None = None


class OrganizationOut(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)
