import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app import crud
from app.api.deps import AdminUser, SessionDep
from app.models import (
    LibraryPlantCreate,
    LibraryPlantPublic,
    LibraryPlantsPublic,
    LibraryPlantUpdate,
    Message,
)

router = APIRouter(prefix="/library-plants", tags=["library-plants"])


@router.get("/", response_model=LibraryPlantsPublic)
def read_library_plants(
    session: SessionDep,
    current_user: AdminUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List all plants in the current admin's library.
    """
    plants, count = crud.get_library_plants(
        session=session, admin_id=current_user.id, skip=skip, limit=limit
    )
    return LibraryPlantsPublic(data=plants, count=count)


@router.post("/", response_model=LibraryPlantPublic, status_code=201)
def create_library_plant(
    plant_in: LibraryPlantCreate,
    session: SessionDep,
    current_user: AdminUser,
) -> Any:
    """
    Add a new plant to the admin's library.
    """
    return crud.create_library_plant(
        session=session, plant_in=plant_in, admin_id=current_user.id
    )


@router.get("/{plant_id}", response_model=LibraryPlantPublic)
def read_library_plant(
    plant_id: uuid.UUID,
    session: SessionDep,
    current_user: AdminUser,
) -> Any:
    """
    Get a single library plant.
    """
    plant = crud.get_library_plant_for_admin(
        session=session, plant_id=plant_id, admin_id=current_user.id
    )
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found in library")
    return plant


@router.patch("/{plant_id}", response_model=LibraryPlantPublic)
def update_library_plant(
    plant_id: uuid.UUID,
    plant_in: LibraryPlantUpdate,
    session: SessionDep,
    current_user: AdminUser,
) -> Any:
    """
    Update a library plant (must belong to the current admin).
    """
    plant = crud.get_library_plant_for_admin(
        session=session, plant_id=plant_id, admin_id=current_user.id
    )
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found in library")
    return crud.update_library_plant(session=session, db_plant=plant, plant_in=plant_in)


@router.delete("/{plant_id}", response_model=Message)
def delete_library_plant(
    plant_id: uuid.UUID,
    session: SessionDep,
    current_user: AdminUser,
) -> Message:
    """
    Remove a plant from the library. Existing garden plants are not affected.
    """
    plant = crud.get_library_plant_for_admin(
        session=session, plant_id=plant_id, admin_id=current_user.id
    )
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found in library")
    session.delete(plant)
    session.commit()
    return Message(message="Plant removed from library")
