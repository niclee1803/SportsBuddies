from pydantic import BaseModel
from typing import List, Optional

# Model to handle user creation
class UserCreate(BaseModel):
    """
    Represents the data required to create a new user.

    Attributes:
    - **firstName**: The first name of the user.
    - **lastName**: The last name of the user.
    - **username**: The unique username of the user.
    - **phone**: The phone number of the user.
    """
    firstName: str
    lastName: str
    username: str
    phone: str


# Model to represent a sport and its associated skill level
class SportSkill(BaseModel):
    """
    Represents a sport and the user's skill level in that sport.

    Attributes:
    - **sport**: The name of the sport (e.g., "Basketball").
    - **skill_level**: The user's skill level in the sport (e.g., "Beginner").
    """
    sport: str
    skill_level: str


# Model to handle user preferences
class UserPreferences(BaseModel):
    """
    Represents the user's preferences, including their sports and skill levels.

    Attributes:
    - **sports_skills**: A list of `SportSkill` objects representing the user's sports and their skill levels.
    """
    sports_skills: List[SportSkill]


# Model to handle profile update requests
class UpdateProfileRequest(BaseModel):
    """
    Represents the data required to update a user's profile.

    Attributes:
    - **first_name**: The updated first name of the user.
    - **last_name**: The updated last name of the user.
    - **username**: The updated username of the user.
    - **phone**: The updated phone number of the user.
    - **email**: The updated email address of the user.
    """
    first_name: str
    last_name: str
    username: str
    phone: str
    email: str