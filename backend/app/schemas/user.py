from __future__ import annotations

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None
    organization_id: int | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    password: str | None = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None = None
    role: str
    organization_id: int | None = None

    class Config:
        from_attributes = True
