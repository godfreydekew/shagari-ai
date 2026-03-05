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
from app.models import Plant, PlantCreate, PlantUpdate, PlantsPublic, PlantPublic, Message

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

@router.delete("/{plant_id}", response_model=PlantPublic)
def delete_plant(
    session: SessionDep, 
    plant_id: uuid.UUID,
    garden_id: uuid.UUID,
    current_user: CurrentUser
    ) -> Message:
    """
    Delete a plant.
    """
    plant = session.get(Plant, plant_id)
    
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    if plant.garden_id != garden_id:
        raise HTTPException(status_code=403, detail="Plant not found in this garden")

    session.delete(plant)
    session.commit()
    session.refresh(plant)
    return Message(message="Plant deleted successfully")

@router.patch("/{plant_id}", response_model=PlantPublic)
def update_plant(
    plant_id: uuid.UUID, 
    plant_update: PlantUpdate, 
    session: SessionDep,
    current_user: CurrentUser
    ) -> PlantPublic:
    """
    Update a plant.
    """
    db_plant = session.get(Plant, plant_id)
    if db_plant.garden_id != current_user.garden_id:
        raise HTTPException(status_code=403, detail="Plant not found in this garden")
    if not db_plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    plant_data = plant_update.model_dump(exclude_unset=True)
    db_plant.sqlmodel_update(plant_data)
    session.add(db_plant)
    session.commit()
    session.refresh(db_plant)
    return db_plant
    
    
    