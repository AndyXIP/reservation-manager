from fastapi import APIRouter

from .organizations import router as organizations_router
from .reservations import router as reservations_router
from .resources import router as resources_router

api_router = APIRouter()
api_router.include_router(resources_router)
api_router.include_router(reservations_router)
api_router.include_router(organizations_router)
