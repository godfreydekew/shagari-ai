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
from app.models import Plant, PlantCreate, PlantUpdate, PlantsPublic, PlantPublic

router = APIRouter(prefix="/plants", tags=["plants"])

@router.get("/", response_model=PlantsPublic)
def read_plants(
    session: SessionDep,
    garden_id: uuid.UUID,
    skip: int = 0, 
    limit: int = 100
) -> Any:
    """
    Retrieve plants.
    """
    base_condition = Plant.garden_id == garden_id
    count_statement = select(func.count()).select_from(Plant).where(base_condition)
    count = session.exec(count_statement).one()
    
    statement = (
        select(Plant).where(base_condition).order_by(col(Plant.created_at).desc()).offset(skip).limit(limit)
    )
    
    plants = session.exec(statement).all()
    if not plants:
        raise HTTPException(status_code=404, detail="No plants found for this garden")
    return PlantsPublic(data=plants, count=count)

@router.post("/{garden_id}", response_model=PlantPublic)
def create_plant(
    session: SessionDep,
    plant_in: PlantCreate,
    garden_id: uuid.UUID,
) -> Any:
    """
    Create a new plant.
    """
    plant = Plant.model_validate(plant_in, update={"garden_id": garden_id})
    session.add(plant)
    session.commit()
    session.refresh(plant)
    return plant