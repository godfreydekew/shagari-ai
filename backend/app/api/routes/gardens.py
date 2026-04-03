import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app import crud
from app.api.deps import AdminUser, CurrentUser, SessionDep, get_current_active_superuser
from app.models import (
    Garden,
    GardenCreate,
    GardenPublic,
    GardenUpdate,
    GardenWithOwner,
    Message,
)

router = APIRouter(prefix="/gardens", tags=["gardens"])


@router.get("/my", response_model=GardenPublic)
def read_my_garden(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Return the garden owned by the current client.
    Returns 404 if the user has no garden linked to their account.
    """
    from sqlmodel import select

    garden = session.exec(
        select(Garden).where(Garden.owner_id == current_user.id)
    ).first()
    if not garden:
        raise HTTPException(
            status_code=404,
            detail="No garden found for your account. Contact your GardenKeeper admin.",
        )
    return garden


@router.get("/", response_model=list[GardenWithOwner])
def read_gardens(
    session: SessionDep,
    current_user: AdminUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List all gardens created by the current admin, with owner info and plant count.
    """
    gardens, _ = crud.get_admin_gardens_with_stats(
        session=session, admin_id=current_user.id, skip=skip, limit=limit
    )
    return gardens


@router.post("/", response_model=GardenPublic, status_code=201)
def create_garden(
    session: SessionDep,
    current_user: AdminUser,
    garden_in: GardenCreate,
) -> Any:
    """
    Create a new garden. A unique GK-XXXX code is generated automatically.
    """
    garden = crud.create_garden(
        session=session, garden_in=garden_in, admin_id=current_user.id
    )
    return garden


@router.get("/{garden_id}", response_model=GardenWithOwner)
def read_garden(
    garden_id: uuid.UUID,
    session: SessionDep,
    current_user: AdminUser,
) -> Any:
    """
    Get a single garden by ID (must belong to the current admin).
    """
    garden = crud.get_garden_for_admin(
        session=session, garden_id=garden_id, admin_id=current_user.id
    )
    if not garden:
        raise HTTPException(status_code=404, detail="Garden not found")

    from sqlmodel import select, func
    from app.models import Plant, User

    plant_count = session.exec(
        select(func.count()).select_from(Plant).where(Plant.garden_id == garden.id)
    ).one()
    owner = session.get(User, garden.owner_id) if garden.owner_id else None

    return GardenWithOwner(
        **garden.model_dump(),
        owner_name=owner.full_name if owner else None,
        owner_email=owner.email if owner else None,
        plant_count=plant_count,
    )


@router.patch("/{garden_id}", response_model=GardenPublic)
def update_garden(
    garden_id: uuid.UUID,
    garden_in: GardenUpdate,
    session: SessionDep,
    current_user: AdminUser,
) -> Any:
    """
    Update a garden's name (must belong to the current admin).
    """
    garden = crud.get_garden_for_admin(
        session=session, garden_id=garden_id, admin_id=current_user.id
    )
    if not garden:
        raise HTTPException(status_code=404, detail="Garden not found")

    return crud.update_garden(session=session, db_garden=garden, garden_in=garden_in)


@router.delete("/{garden_id}", response_model=Message)
def delete_garden(
    garden_id: uuid.UUID,
    session: SessionDep,
    current_user: AdminUser,
) -> Message:
    """
    Delete a garden and all its plants (must belong to the current admin).
    """
    garden = crud.get_garden_for_admin(
        session=session, garden_id=garden_id, admin_id=current_user.id
    )
    if not garden:
        raise HTTPException(status_code=404, detail="Garden not found")

    session.delete(garden)
    session.commit()
    return Message(message="Garden deleted successfully")
