import uuid
from datetime import datetime, timezone

from pydantic import EmailStr
from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


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
    full_name: str | None = Field(default=None, max_length=255)


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
    gardens: list["Garden"] = Relationship(back_populates="owner", cascade_delete=True)


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
    description: str | None = Field(default=None, max_length=255)
    location: str | None = Field(default=None, max_length=255)


class GardenCreate(GardenBase):
    pass


class GardenUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=255)
    location: str | None = Field(default=None, max_length=255)


class Garden(GardenBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default=None, sa_type=DateTime(timezone=True)
    )
    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    owner: User = Relationship(back_populates="gardens")
    plants: list["Plant"] = Relationship(back_populates="garden", cascade_delete=True)
    documents: list["Document"] = Relationship(back_populates="garden", cascade_delete=True)


class GardenPublic(GardenBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


class GardensPublic(SQLModel):
    data: list[GardenPublic]
    count: int


# ─── Plant ───────────────────────────────────────────────────────────────────

class PlantBase(SQLModel):
    name: str = Field(max_length=255)
    latin_name: str | None = Field(default=None, max_length=255)
    category: str = Field(max_length=255)
    maintenance_advice: str | None = Field(default=None)
    reference: str | None = Field(default=None, max_length=255)
    image_url: str | None = Field(default=None, max_length=255)
    planted_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))


class PlantCreate(PlantBase):
    pass


class PlantUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255)
    latin_name: str | None = Field(default=None, max_length=255)
    category: str | None = Field(default=None, max_length=255)
    maintenance_advice: str | None = Field(default=None)
    reference: str | None = Field(default=None, max_length=255)
    image_url: str | None = Field(default=None, max_length=255)
    planted_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))


class Plant(PlantBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default=None, sa_type=DateTime(timezone=True)
    )
    garden_id: uuid.UUID = Field(foreign_key="garden.id", nullable=False, ondelete="CASCADE")
    garden: Garden = Relationship(back_populates="plants")


class PlantPublic(PlantBase):
    id: uuid.UUID
    garden_id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


class PlantsPublic(SQLModel):
    data: list[PlantPublic]
    count: int


# ─── Document ────────────────────────────────────────────────────────────────

class DocumentBase(SQLModel):
    name: str = Field(max_length=255)
    description: str | None = Field(default=None, max_length=255)
    file_url: str | None = Field(default=None, max_length=255)


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=255)
    file_url: str | None = Field(default=None, max_length=255)


class Document(DocumentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default=None, sa_type=DateTime(timezone=True)
    )
    garden_id: uuid.UUID = Field(foreign_key="garden.id", nullable=False, ondelete="CASCADE")
    garden: Garden = Relationship(back_populates="documents")


class DocumentPublic(DocumentBase):
    id: uuid.UUID
    garden_id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


class DocumentsPublic(SQLModel):
    data: list[DocumentPublic]
    count: int
