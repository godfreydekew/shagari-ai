import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import col, func, select

from app import crud
from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.models import Garden, GardenCreate, GardenUpdate, GardensPublic, GardenPublic

router = APIRouter(prefix="/gardens", tags=["gardens"])

@router.get("/", response_model=GardensPublic)
def read_gardens(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0, 
    limit: int = 100
) -> Any:
    """
    Retrieve gardens.
    """
    
    base_condition = Garden.owner_id == current_user.id
    
    count_statement = select(func.count()).select_from(Garden).where(base_condition)
    count = session.exec(count_statement).one()

    statement = (
        select(Garden).where(base_condition).order_by(col(Garden.created_at).desc()).offset(skip).limit(limit)
    )
    gardens = session.exec(statement).all()
    
    if not gardens:
        raise HTTPException(status_code=404, detail="No gardens found")
    
    return GardensPublic(data=gardens, count=count)

@router.post("/", response_model=GardenPublic)
def create_garden(
    session: SessionDep,
    current_user: CurrentUser,
    garden_in: GardenCreate
) -> Any:
    """
    Create a new garden.
    """
    
    garden = Garden.model_validate(garden_in, update={"owner_id": current_user.id})
    session.add(garden)
    session.commit()
    session.refresh(garden)
    return garden