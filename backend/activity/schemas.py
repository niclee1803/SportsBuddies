"""
Pydantic models for request/response validation of Activity payloads.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime

class ActivityType(str, Enum):
    """Represents different activity types."""
    COACHING = "coaching session"
    EVENT = "event"

class SkillLevel(str, Enum):
    """Represents the available skill levels."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    PROFESSIONAL = "professional"

class LocationSchema(BaseModel):
    """Schema for location coordinates."""
    latitude: float
    longitude: float

class ActivityCreate(BaseModel):
    """
    Schema for creating a new activity.
    """
    activityName: str
    bannerImageUrl: Optional[str] = ""
    type: ActivityType
    price: int
    sport: str
    skillLevel: SkillLevel
    description: str
    maxParticipants: int
    dateTime: datetime
    location: LocationSchema

class ActivityUpdate(BaseModel):
    """
    Schema for updating existing activities.
    """
    activityName: Optional[str] = None
    bannerImageUrl: Optional[str] = None
    type: Optional[ActivityType] = None
    price: Optional[int] = None
    sport: Optional[str] = None
    skillLevel: Optional[SkillLevel] = None
    description: Optional[str] = None
    maxParticipants: Optional[int] = None
    dateTime: Optional[datetime] = None
    location: Optional[LocationSchema] = None