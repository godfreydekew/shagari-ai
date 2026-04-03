import random
import string
import uuid
from typing import Any

from sqlmodel import Session, col, func, select

from app.core.security import get_password_hash, verify_password
from app.models import (
    Garden,
    GardenCreate,
    GardenUpdate,
    GardenWithOwner,
    LibraryPlant,
    LibraryPlantCreate,
    LibraryPlantUpdate,
    Plant,
    PlantCreate,
    PlantUpdate,
    User,
    UserCreate,
    UserUpdate,
)


# ─── User ────────────────────────────────────────────────────────────────────

def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


# Dummy hash to use for timing attack prevention when user is not found
# This is an Argon2 hash of a random password, used to ensure constant-time comparison
DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$MjQyZWE1MzBjYjJlZTI0Yw$YTU4NGM5ZTZmYjE2NzZlZjY0ZWY3ZGRkY2U2OWFjNjk"


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        # Prevent timing attacks by running password verification even when user doesn't exist
        verify_password(password, DUMMY_HASH)
        return None
    verified, updated_password_hash = verify_password(password, db_user.hashed_password)
    if not verified:
        return None
    if updated_password_hash:
        db_user.hashed_password = updated_password_hash
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
    return db_user


# ─── Garden ──────────────────────────────────────────────────────────────────

def _generate_garden_code(*, session: Session) -> str:
    """Generate a unique GK-XXXX garden code, retrying on collision."""
    chars = string.ascii_uppercase + string.digits
    while True:
        code = "GK-" + "".join(random.choices(chars, k=4))
        existing = session.exec(select(Garden).where(Garden.garden_code == code)).first()
        if not existing:
            return code


def get_garden_by_code(*, session: Session, garden_code: str) -> Garden | None:
    return session.exec(select(Garden).where(Garden.garden_code == garden_code)).first()


def create_garden(*, session: Session, garden_in: GardenCreate, admin_id: uuid.UUID) -> Garden:
    garden_code = _generate_garden_code(session=session)
    garden = Garden.model_validate(
        garden_in,
        update={"garden_code": garden_code, "created_by": admin_id, "owner_id": None},
    )
    session.add(garden)
    session.commit()
    session.refresh(garden)
    return garden


def update_garden(*, session: Session, db_garden: Garden, garden_in: GardenUpdate) -> Garden:
    garden_data = garden_in.model_dump(exclude_unset=True)
    db_garden.sqlmodel_update(garden_data)
    session.add(db_garden)
    session.commit()
    session.refresh(db_garden)
    return db_garden


def get_admin_gardens_with_stats(
    *, session: Session, admin_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> tuple[list[GardenWithOwner], int]:
    """
    Returns all gardens created by this admin, enriched with owner info and plant count.
    Multiple DB calls are used here to keep the query readable — for a typical admin
    with tens of gardens this is acceptable.
    """
    count = session.exec(
        select(func.count()).select_from(Garden).where(Garden.created_by == admin_id)
    ).one()

    gardens = session.exec(
        select(Garden)
        .where(Garden.created_by == admin_id)
        .order_by(col(Garden.created_at).desc())
        .offset(skip)
        .limit(limit)
    ).all()

    result: list[GardenWithOwner] = []
    for garden in gardens:
        plant_count = session.exec(
            select(func.count()).select_from(Plant).where(Plant.garden_id == garden.id)
        ).one()

        owner: User | None = session.get(User, garden.owner_id) if garden.owner_id else None

        result.append(
            GardenWithOwner(
                id=garden.id,
                name=garden.name,
                garden_code=garden.garden_code,
                created_by=garden.created_by,
                owner_id=garden.owner_id,
                created_at=garden.created_at,
                updated_at=garden.updated_at,
                owner_name=owner.full_name if owner else None,
                owner_email=owner.email if owner else None,
                plant_count=plant_count,
            )
        )
    return result, count


def get_garden_for_admin(
    *, session: Session, garden_id: uuid.UUID, admin_id: uuid.UUID
) -> Garden | None:
    """Fetch a garden only if it was created by this admin."""
    return session.exec(
        select(Garden).where(Garden.id == garden_id, Garden.created_by == admin_id)
    ).first()


# ─── Library Plant ───────────────────────────────────────────────────────────

def create_library_plant(
    *, session: Session, plant_in: LibraryPlantCreate, admin_id: uuid.UUID
) -> LibraryPlant:
    plant = LibraryPlant.model_validate(plant_in, update={"created_by": admin_id})
    session.add(plant)
    session.commit()
    session.refresh(plant)
    return plant


def update_library_plant(
    *, session: Session, db_plant: LibraryPlant, plant_in: LibraryPlantUpdate
) -> LibraryPlant:
    plant_data = plant_in.model_dump(exclude_unset=True)
    db_plant.sqlmodel_update(plant_data)
    session.add(db_plant)
    session.commit()
    session.refresh(db_plant)
    return db_plant


def get_library_plants(
    *, session: Session, admin_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> tuple[list[LibraryPlant], int]:
    count = session.exec(
        select(func.count()).select_from(LibraryPlant).where(LibraryPlant.created_by == admin_id)
    ).one()
    plants = session.exec(
        select(LibraryPlant)
        .where(LibraryPlant.created_by == admin_id)
        .order_by(col(LibraryPlant.common_name))
        .offset(skip)
        .limit(limit)
    ).all()
    return list(plants), count


def get_library_plant_for_admin(
    *, session: Session, plant_id: uuid.UUID, admin_id: uuid.UUID
) -> LibraryPlant | None:
    return session.exec(
        select(LibraryPlant).where(
            LibraryPlant.id == plant_id, LibraryPlant.created_by == admin_id
        )
    ).first()


# ─── Plant ───────────────────────────────────────────────────────────────────

def create_plant(
    *, session: Session, plant_in: PlantCreate, garden_id: uuid.UUID
) -> Plant:
    plant = Plant.model_validate(plant_in, update={"garden_id": garden_id})
    session.add(plant)
    session.commit()
    session.refresh(plant)
    return plant


def create_plant_from_library(
    *, session: Session, library_plant: LibraryPlant, garden_id: uuid.UUID
) -> Plant:
    """Copy a library plant into a garden as an independent plant record."""
    plant = Plant(
        garden_id=garden_id,
        library_plant_id=library_plant.id,
        common_name=library_plant.common_name,
        latin_name=library_plant.latin_name,
        reference=library_plant.reference,
        overview=library_plant.overview,
        spring_care=library_plant.spring_care,
        summer_care=library_plant.summer_care,
        autumn_care=library_plant.autumn_care,
        winter_care=library_plant.winter_care,
        image_url=library_plant.image_url,
    )
    session.add(plant)
    session.commit()
    session.refresh(plant)
    return plant


def update_plant(*, session: Session, db_plant: Plant, plant_in: PlantUpdate) -> Plant:
    plant_data = plant_in.model_dump(exclude_unset=True)
    db_plant.sqlmodel_update(plant_data)
    session.add(db_plant)
    session.commit()
    session.refresh(db_plant)
    return db_plant


def get_plants_for_garden(
    *, session: Session, garden_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> tuple[list[Plant], int]:
    count = session.exec(
        select(func.count()).select_from(Plant).where(Plant.garden_id == garden_id)
    ).one()
    plants = session.exec(
        select(Plant)
        .where(Plant.garden_id == garden_id)
        .order_by(col(Plant.created_at).desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return list(plants), count


def get_plant_in_garden(
    *, session: Session, plant_id: uuid.UUID, garden_id: uuid.UUID
) -> Plant | None:
    return session.exec(
        select(Plant).where(Plant.id == plant_id, Plant.garden_id == garden_id)
    ).first()
