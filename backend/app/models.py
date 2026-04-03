import enum
import uuid
from datetime import date, datetime, time, timezone
from typing import Optional

from pydantic import EmailStr
from sqlalchemy import DateTime, Enum, Time
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# ─── Enums ───────────────────────────────────────────────────────────────────

class ReminderType(str, enum.Enum):
    watering = "watering"
    pruning = "pruning"
    feeding = "feeding"
    general = "general"


class ReminderRepeat(str, enum.Enum):
    once = "once"
    weekly = "weekly"
    monthly = "monthly"


# ─── User ────────────────────────────────────────────────────────────────────

class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    is_admin: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    phone_number: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(max_length=255)
    garden_code: str | None = Field(default=None, max_length=16)


class UserUpdate(SQLModel):
    email: EmailStr | None = Field(default=None, max_length=255)
    full_name: str | None = Field(default=None, max_length=255)
    phone_number: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None
    is_superuser: bool | None = None
    is_admin: bool | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default=None, sa_type=DateTime(timezone=True)
    )
    created_gardens: list["Garden"] = Relationship(
        back_populates="creator",
        sa_relationship_kwargs={"foreign_keys": "[Garden.created_by]"},
    )
    owned_garden: Optional["Garden"] = Relationship(
        back_populates="owner",
        sa_relationship_kwargs={"foreign_keys": "[Garden.owner_id]", "uselist": False},
    )
    library_plants: list["LibraryPlant"] = Relationship(back_populates="creator")


class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# ─── Auth ────────────────────────────────────────────────────────────────────

class Message(SQLModel):
    message: str


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


# ─── Garden ──────────────────────────────────────────────────────────────────

class GardenBase(SQLModel):
    name: str = Field(max_length=255)


class GardenCreate(GardenBase):
    pass


class GardenUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255)


class Garden(GardenBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    garden_code: str = Field(max_length=16, unique=True, index=True)
    created_by: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    owner_id: uuid.UUID | None = Field(
        default=None, foreign_key="user.id", nullable=True, ondelete="SET NULL"
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default=None, sa_type=DateTime(timezone=True)
    )
    creator: User = Relationship(
        back_populates="created_gardens",
        sa_relationship_kwargs={"foreign_keys": "[Garden.created_by]"},
    )
    owner: Optional["User"] = Relationship(
        back_populates="owned_garden",
        sa_relationship_kwargs={"foreign_keys": "[Garden.owner_id]", "uselist": False},
    )
    plants: list["Plant"] = Relationship(back_populates="garden", cascade_delete=True)


class GardenPublic(GardenBase):
    id: uuid.UUID
    garden_code: str
    created_by: uuid.UUID
    owner_id: uuid.UUID | None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class GardenWithOwner(GardenPublic):
    owner_name: str | None = None
    owner_email: str | None = None
    plant_count: int = 0


class GardensPublic(SQLModel):
    data: list[GardenPublic]
    count: int


# ─── Library Plant ───────────────────────────────────────────────────────────

class LibraryPlantBase(SQLModel):
    common_name: str = Field(max_length=255)
    latin_name: str = Field(max_length=255)
    reference: str | None = Field(default=None, max_length=255)
    overview: str | None = Field(default=None)
    spring_care: str | None = Field(default=None)
    summer_care: str | None = Field(default=None)
    autumn_care: str | None = Field(default=None)
    winter_care: str | None = Field(default=None)
    image_url: str | None = Field(default=None)


class LibraryPlantCreate(LibraryPlantBase):
    pass


class LibraryPlantUpdate(SQLModel):
    common_name: str | None = Field(default=None, max_length=255)
    latin_name: str | None = Field(default=None, max_length=255)
    reference: str | None = Field(default=None, max_length=255)
    overview: str | None = Field(default=None)
    spring_care: str | None = Field(default=None)
    summer_care: str | None = Field(default=None)
    autumn_care: str | None = Field(default=None)
    winter_care: str | None = Field(default=None)
    image_url: str | None = Field(default=None)


class LibraryPlant(LibraryPlantBase, table=True):
    __tablename__ = "libraryplant"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_by: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default=None, sa_type=DateTime(timezone=True)
    )
    creator: User = Relationship(back_populates="library_plants")
    garden_plants: list["Plant"] = Relationship(back_populates="library_plant")


class LibraryPlantPublic(LibraryPlantBase):
    id: uuid.UUID
    created_by: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


class LibraryPlantsPublic(SQLModel):
    data: list[LibraryPlantPublic]
    count: int


# ─── Plant ───────────────────────────────────────────────────────────────────

class PlantBase(SQLModel):
    common_name: str = Field(max_length=255)
    latin_name: str = Field(max_length=255)
    reference: str | None = Field(default=None, max_length=255)
    overview: str | None = Field(default=None)
    spring_care: str | None = Field(default=None)
    summer_care: str | None = Field(default=None)
    autumn_care: str | None = Field(default=None)
    winter_care: str | None = Field(default=None)
    image_url: str | None = Field(default=None)


class PlantCreate(PlantBase):
    library_plant_id: uuid.UUID | None = None


class PlantCreateFromLibrary(SQLModel):
    library_plant_id: uuid.UUID


class PlantUpdate(SQLModel):
    common_name: str | None = Field(default=None, max_length=255)
    latin_name: str | None = Field(default=None, max_length=255)
    reference: str | None = Field(default=None, max_length=255)
    overview: str | None = Field(default=None)
    spring_care: str | None = Field(default=None)
    summer_care: str | None = Field(default=None)
    autumn_care: str | None = Field(default=None)
    winter_care: str | None = Field(default=None)
    image_url: str | None = Field(default=None)


class Plant(PlantBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    garden_id: uuid.UUID = Field(
        foreign_key="garden.id", nullable=False, ondelete="CASCADE"
    )
    library_plant_id: uuid.UUID | None = Field(
        default=None, foreign_key="libraryplant.id", nullable=True, ondelete="SET NULL"
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default=None, sa_type=DateTime(timezone=True)
    )
    garden: Garden = Relationship(back_populates="plants")
    library_plant: Optional["LibraryPlant"] = Relationship(back_populates="garden_plants")
    reminders: list["Reminder"] = Relationship(back_populates="plant", cascade_delete=True)


class PlantPublic(PlantBase):
    id: uuid.UUID
    garden_id: uuid.UUID
    library_plant_id: uuid.UUID | None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class PlantsPublic(SQLModel):
    data: list[PlantPublic]
    count: int


# ─── Reminder ────────────────────────────────────────────────────────────────

class ReminderBase(SQLModel):
    title: str = Field(max_length=255)
    type: ReminderType
    scheduled_date: date
    scheduled_time: time | None = Field(default=None, sa_type=Time)  # type: ignore
    repeat: ReminderRepeat = ReminderRepeat.once
    completed: bool = False


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(SQLModel):
    title: str | None = Field(default=None, max_length=255)
    type: ReminderType | None = None
    scheduled_date: date | None = None
    scheduled_time: time | None = None
    repeat: ReminderRepeat | None = None
    completed: bool | None = None


class Reminder(ReminderBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    plant_id: uuid.UUID = Field(
        foreign_key="plant.id", nullable=False, ondelete="CASCADE"
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default=None, sa_type=DateTime(timezone=True)
    )
    plant: Plant = Relationship(back_populates="reminders")


class ReminderPublic(ReminderBase):
    id: uuid.UUID
    plant_id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


class RemindersPublic(SQLModel):
    data: list[ReminderPublic]
    count: int
