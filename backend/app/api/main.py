from fastapi import APIRouter

from app.api.routes import gardens, library_plants, login, plants, private, users, utils
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(gardens.router)
api_router.include_router(plants.router)
api_router.include_router(library_plants.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
