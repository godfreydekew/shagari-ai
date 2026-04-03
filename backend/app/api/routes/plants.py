import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app import crud
from app.api.deps import AdminUser, CurrentUser, SessionDep
from app.models import (
    Garden,
    LibraryPlant,
    Message,
    PlantCreate,
    PlantCreateFromLibrary,
    PlantPublic,
    PlantsPublic,
    PlantUpdate,
)

router = APIRouter(prefix="/gardens/{garden_id}/plants", tags=["plants"])


def _get_garden_for_read(session: Any, garden_id: uuid.UUID, current_user: Any) -> Garden:
    """
    Allow garden read access to:
    - Admins / superusers who created the garden
    - The client who owns the garden
    """
    garden = session.get(Garden, garden_id)
    if not garden:
        raise HTTPException(status_code=404, detail="Garden not found")

    if current_user.is_admin or current_user.is_superuser:
        if garden.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Garden not found")
    else:
        if garden.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Garden not found")

    return garden


def _require_admin_garden(session: Any, garden_id: uuid.UUID, admin_id: uuid.UUID) -> Garden:
    garden = crud.get_garden_for_admin(
        session=session, garden_id=garden_id, admin_id=admin_id
    )
    if not garden:
        raise HTTPException(status_code=404, detail="Garden not found")
    return garden


# ─── Read (admin + garden owner) ─────────────────────────────────────────────

@router.get("/", response_model=PlantsPublic)
def read_plants(
    garden_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List all plants in a garden.
    Accessible by the admin who created the garden or the client who owns it.
    """
    _get_garden_for_read(session, garden_id, current_user)
    plants, count = crud.get_plants_for_garden(
        session=session, garden_id=garden_id, skip=skip, limit=limit
    )
    return PlantsPublic(data=plants, count=count)


@router.get("/{plant_id}", response_model=PlantPublic)
def read_plant(
    garden_id: uuid.UUID,
    plant_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Get a single plant.
    Accessible by the admin who created the garden or the client who owns it.
    """
    _get_garden_for_read(session, garden_id, current_user)
    plant = crud.get_plant_in_garden(session=session, plant_id=plant_id, garden_id=garden_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found in this garden")
    return plant


# ─── Write (admin only) ───────────────────────────────────────────────────────

@router.post("/", response_model=PlantPublic, status_code=201)
def create_plant(
    garden_id: uuid.UUID,
    plant_in: PlantCreate,
    session: SessionDep,
    current_user: AdminUser,
) -> Any:
    """Add a new plant (from scratch) to a garden."""
    _require_admin_garden(session, garden_id, current_user.id)
    return crud.create_plant(session=session, plant_in=plant_in, garden_id=garden_id)


@router.post("/from-library", response_model=PlantPublic, status_code=201)
def create_plant_from_library(
    garden_id: uuid.UUID,
    body: PlantCreateFromLibrary,
    session: SessionDep,
    current_user: AdminUser,
) -> Any:
    """Copy a library plant into this garden as an independent plant record."""
    _require_admin_garden(session, garden_id, current_user.id)

    library_plant = session.get(LibraryPlant, body.library_plant_id)
    if not library_plant or library_plant.created_by != current_user.id:
        raise HTTPException(status_code=404, detail="Library plant not found")

    existing_plants, _ = crud.get_plants_for_garden(session=session, garden_id=garden_id)
    if any(p.library_plant_id == library_plant.id for p in existing_plants):
        raise HTTPException(
            status_code=409,
            detail=f"{library_plant.common_name} is already in this garden",
        )

    return crud.create_plant_from_library(
        session=session, library_plant=library_plant, garden_id=garden_id
    )


@router.patch("/{plant_id}", response_model=PlantPublic)
def update_plant(
    garden_id: uuid.UUID,
    plant_id: uuid.UUID,
    plant_in: PlantUpdate,
    session: SessionDep,
    current_user: AdminUser,
) -> Any:
    """Update a plant in a garden."""
    _require_admin_garden(session, garden_id, current_user.id)
    plant = crud.get_plant_in_garden(session=session, plant_id=plant_id, garden_id=garden_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found in this garden")
    return crud.update_plant(session=session, db_plant=plant, plant_in=plant_in)


@router.delete("/{plant_id}", response_model=Message)
def delete_plant(
    garden_id: uuid.UUID,
    plant_id: uuid.UUID,
    session: SessionDep,
    current_user: AdminUser,
) -> Message:
    """Remove a plant from a garden (also deletes its reminders)."""
    _require_admin_garden(session, garden_id, current_user.id)
    plant = crud.get_plant_in_garden(session=session, plant_id=plant_id, garden_id=garden_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found in this garden")
    name = plant.common_name
    session.delete(plant)
    session.commit()
    return Message(message=f"{name} removed from garden")
