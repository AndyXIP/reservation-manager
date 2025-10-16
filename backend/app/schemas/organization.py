from __future__ import annotations

from pydantic import BaseModel


class OrganizationCreate(BaseModel):
    name: str


class OrganizationUpdate(BaseModel):
    name: str | None = None


class OrganizationOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
