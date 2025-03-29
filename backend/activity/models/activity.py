"""
Domain model classes and enums for Activity objects in Firestore.
"""

from datetime import datetime
from dataclasses import dataclass
from firebase_admin import firestore
from enum import Enum
from typing import List, Optional, Dict, Any, Union


class ActivityType(str, Enum):
    """Represents the type of an activity."""
    COACHING = "coaching session"
    EVENT = "event"


class SkillLevel(str, Enum):
    """Represents the skill level available for an activity."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    PROFESSIONAL = "professional"


class ActivityStatus(str, Enum):
    """Represents the overall status of an activity."""
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    AVAILABLE = "available"


@dataclass
class Location:
    """Location abstraction to reduce coupling with Firestore."""
    latitude: float
    longitude: float

    @classmethod
    def from_geo_point(cls, geo_point: 'firestore.GeoPoint') -> 'Location':
        """Create a Location from a Firestore GeoPoint."""
        return cls(latitude=geo_point.latitude, longitude=geo_point.longitude)

    def to_geo_point(self) -> 'firestore.GeoPoint':
        """Convert to a Firestore GeoPoint."""
        return firestore.GeoPoint(self.latitude, self.longitude)


class ActivityError(Exception):
    """Base exception for Activity-related errors."""
    pass


class Activity:
    """
    Domain model for activities in Firestore.
    
    Attributes:
        id (str): Unique ID of the activity document.
        activityName (str): Name of the activity.
        bannerImageUrl (str): URL of the banner image.
        type (ActivityType): Type of the activity (coaching session/event).
        price (int): Price for the activity (e.g., coaching fee).
        sport (str): Name of the sport.
        skillLevel (SkillLevel): Participant skill level.
        description (str): Description of the activity.
        creator_id (str): Reference to user who created this activity.
        location (Location): Location of the activity.
        dateTime (datetime): Scheduled date and time for the activity.
        participants (list): Current participants' user IDs.
        joinRequests (list): Pending join requests from users.
        maxParticipants (int): Maximum allowed number of participants.
        placeName (str): Human-readable name of the place where the activity is held.
        status (ActivityStatus): Current activity status.
    """

    def __init__(
        self,
        activity_id: str,
        activityName: str,
        sport: str,
        creator_id: str,
        location: Union[Location, firestore.GeoPoint],
        dateTime: datetime,
        maxParticipants: int,
        placeName: str, 
        bannerImageUrl: str = "",
        type: ActivityType = ActivityType.EVENT,
        price: int = 0,
        skillLevel: SkillLevel = SkillLevel.BEGINNER,
        description: str = "",
        participants: Optional[List[str]] = None,
        joinRequests: Optional[List[str]] = None,
        status: ActivityStatus = ActivityStatus.AVAILABLE
    ):
        self.id = activity_id
        self.activityName = activityName
        self.bannerImageUrl = bannerImageUrl
        self.type = type if isinstance(type, ActivityType) else ActivityType(type)
        self.price = price
        self.sport = sport
        self.skillLevel = skillLevel if isinstance(skillLevel, SkillLevel) else SkillLevel(skillLevel)
        self.description = description
        self.creator_id = creator_id
        self.placeName = placeName 
        
        # Handle different location types
        if isinstance(location, firestore.GeoPoint):
            self.location = location
        elif isinstance(location, Location):
            self.location = location.to_geo_point()
        else:
            raise TypeError("location must be a GeoPoint or Location")
            
        self.dateTime = dateTime
        self.participants = participants or []
        self.joinRequests = joinRequests or []
        self.maxParticipants = maxParticipants
        self.status = status if isinstance(status, ActivityStatus) else ActivityStatus(status)
        
        # Validate the activity
        if not self._validate():
            raise ActivityError("Invalid activity data")

    def _validate(self) -> bool:
        """Validate that the activity data is complete and valid."""
        if not self.activityName or not self.sport:
            return False
        if self.maxParticipants <= 0:
            return False
        if not self.creator_id:
            return False
        if not isinstance(self.dateTime, datetime):
            return False
        if not self.placeName:
            return False
        return True

    def is_full(self) -> bool:
        """Check if the activity has reached its maximum participants."""
        return len(self.participants) >= self.maxParticipants

    def can_join(self, user_id: str) -> bool:
        """Determines if a user can join this activity."""
        return (self.status == ActivityStatus.AVAILABLE and 
                not self.is_full() and
                user_id not in self.participants and
                user_id != self.creator_id and
                user_id not in self.joinRequests)

    def is_creator(self, user_id: str) -> bool:
        """Check if the given user ID is the creator of this activity."""
        return self.creator_id == user_id

    def has_participant(self, user_id: str) -> bool:
        """Check if a user is a participant."""
        return user_id in self.participants
    
    def has_join_request(self, user_id: str) -> bool:
        """Check if a user has a pending join request."""
        return user_id in self.joinRequests

    def add_join_request(self, user_id: str) -> bool:
        """Add a join request for a user."""
        if self.can_join(user_id):
            self.joinRequests.append(user_id)
            return True
        return False
    
    def cancel_join_request(self, user_id: str) -> bool:
        """Cancel a join request by user."""
        if user_id in self.joinRequests:
            self.joinRequests.remove(user_id)
            return True
        return False

    def approve_join_request(self, user_id: str) -> bool:
        """Approve a join request and add user to participants."""
        if user_id in self.joinRequests and not self.is_full():
            self.joinRequests.remove(user_id)
            self.participants.append(user_id)
            return True
        return False

    def reject_join_request(self, user_id: str) -> bool:
        """Reject a join request."""
        if user_id in self.joinRequests:
            self.joinRequests.remove(user_id)
            return True
        return False

    def remove_participant(self, user_id: str) -> bool:
        """Remove a participant from the activity."""
        if user_id in self.participants:
            self.participants.remove(user_id)
            return True
        return False

    def cancel(self) -> None:
        """Cancel this activity."""
        self.status = ActivityStatus.CANCELLED
        
    def expire(self) -> None:
        """Mark this activity as expired."""
        self.status = ActivityStatus.EXPIRED

    def update_location(self, location: Union[Location, firestore.GeoPoint]) -> None:
        """Update activity location."""
        if isinstance(location, firestore.GeoPoint):
            self.location = location
        elif isinstance(location, Location):
            self.location = location.to_geo_point()
        else:
            raise TypeError("location must be a GeoPoint or Location")

    def get_location_as_object(self) -> Location:
        """Get the location as a Location object."""
        return Location.from_geo_point(self.location)
    
    def is_expired(self) -> bool:
        """Check if the activity date has passed."""
        return self.dateTime < datetime.now()
    
    def should_expire(self) -> bool:
        """Check if the activity should be marked as expired based on date."""
        return self.is_expired() and self.status == ActivityStatus.AVAILABLE

    @classmethod
    def from_dict(cls, activity_id: str, data: Dict[str, Any]) -> 'Activity':
        """Create an Activity object from a dictionary."""
        if not data:
            raise ActivityError("Cannot create activity from empty data")
        
        # Handle datetime conversion if stored as timestamp
        date_time = data.get("dateTime")
        if isinstance(date_time, dict) and "seconds" in date_time:
            date_time = datetime.fromtimestamp(date_time["seconds"])
        
        # Convert location dictionary to Location object
        location = data.get("location")
        if isinstance(location, dict) and "latitude" in location and "longitude" in location:
            location = Location(latitude=location["latitude"], longitude=location["longitude"])
        
        # Check for required fields
        if "placeName" not in data:
            raise ActivityError("Missing required field: placeName")
        
        return cls(
            activity_id=activity_id,
            activityName=data.get("activityName", ""),
            bannerImageUrl=data.get("bannerImageUrl", ""),
            type=data.get("type", ActivityType.EVENT),
            price=data.get("price", 0),
            sport=data.get("sport", ""),
            skillLevel=data.get("skillLevel", SkillLevel.BEGINNER),
            description=data.get("description", ""),
            creator_id=data.get("creator_id", ""),
            location=location,  # Use the converted location variable here
            placeName=data.get("placeName"),  # Now required
            dateTime=date_time,
            participants=data.get("participants", []),
            joinRequests=data.get("joinRequests", []),
            maxParticipants=data.get("maxParticipants", 0),
            status=data.get("status", ActivityStatus.AVAILABLE)
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert the Activity object into a dictionary."""
        # Convert GeoPoint to dictionary
        location_dict = None
        if self.location:
            location_obj = self.get_location_as_object()
            location_dict = {"latitude": location_obj.latitude, "longitude": location_obj.longitude}
            
        # Format datetime as ISO string
        date_time_str = self.dateTime.isoformat() if self.dateTime else None
        
        return {
            "id": self.id,  # Include ID in the response
            "activityName": self.activityName,
            "bannerImageUrl": self.bannerImageUrl,
            "type": self.type.value,
            "price": self.price,
            "sport": self.sport,
            "skillLevel": self.skillLevel.value,
            "description": self.description,
            "creator_id": self.creator_id,
            "location": location_dict,  # Use the dict representation
            "placeName": self.placeName,  # Add the placeName field
            "dateTime": date_time_str,  # Use the string representation
            "participants": self.participants,
            "joinRequests": self.joinRequests,
            "maxParticipants": self.maxParticipants,
            "status": self.status.value
        }
        
    @classmethod
    def create(cls, **kwargs) -> 'Activity':
        """Factory method to create an Activity with better readability."""
        return cls(**kwargs)
        
    def __str__(self) -> str:
        """String representation for debugging and logging."""
        return f"Activity({self.id}: {self.activityName}, {self.sport}, {self.status.value})"
    
    def __repr__(self) -> str:
        """Detailed string representation."""
        return (f"Activity(id={self.id!r}, activityName={self.activityName!r}, "
                f"sport={self.sport!r}, status={self.status.value!r})")