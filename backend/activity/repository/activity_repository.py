"""
Data access layer for Activity documents in Firestore.
"""

from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
from firebase_admin import firestore
from fastapi import HTTPException
from activity.models.activity import Activity, ActivityStatus, Location

class FirestoreError(Exception):
    """Custom exception for Firestore errors."""
    pass

class ActivityRepository:
    """Interacts with the 'activities' collection in Firestore."""
    
    def __init__(self):
        self.db = firestore.client()
        self.collection = self.db.collection('activities')
    
    def create(self, activity_id: str, data: dict) -> Activity:
        """
        Creates a new activity document in Firestore.
        
        Args:
            activity_id (str): The intended ID for the activity document.
            data (dict): The data to be stored in the document.
        
        Returns:
            Activity: The newly created Activity object.
        """
        try:
            self.collection.document(activity_id).set(data)
            return Activity.from_dict(activity_id, data)
        except Exception as e:
            raise FirestoreError(f"Failed to create activity: {str(e)}")
    
    def get_by_id(self, activity_id: str) -> Optional[Activity]:
        """
        Retrieves an activity by its document ID.
        
        Args:
            activity_id (str): The ID of the activity document.
        
        Returns:
            Activity or None if the document doesn't exist.
        """
        try:
            doc = self.collection.document(activity_id).get()
            if not doc.exists:
                return None
            return Activity.from_dict(doc.id, doc.to_dict())
        except Exception as e:
            raise FirestoreError(f"Failed to retrieve activity {activity_id}: {str(e)}")
    
    def update(self, activity_id: str, data: dict) -> bool:
        """
        Updates an existing activity document by ID.
        
        Args:
            activity_id (str): The ID of the activity document.
            data (dict): Fields to update in the activity.
        
        Returns:
            bool: True if successful.
        """
        try:
            self.collection.document(activity_id).update(data)
            return True
        except Exception as e:
            raise FirestoreError(f"Failed to update activity {activity_id}: {str(e)}")
    
    def delete(self, activity_id: str) -> bool:
        """
        Deletes an activity document by ID.
        
        Args:
            activity_id (str): The ID of the activity document.
        
        Returns:
            bool: True if successful.
        """
        try:
            self.collection.document(activity_id).delete()
            return True
        except Exception as e:
            raise FirestoreError(f"Failed to delete activity {activity_id}: {str(e)}")
    
    def list_by_creator(self, creator_id: str, limit: int = 50, start_after: str = None) -> List[Activity]:
        """
        Retrieves activities created by a specific user with pagination.
        
        Args:
            creator_id (str): The user's ID.
            limit (int): Maximum number of documents to return.
            start_after (str): Document ID to start after for pagination.
            
        Returns:
            List[Activity]: A list of activity objects.
        """
        try:
            query = self.collection.where("creator_id", "==", creator_id)
            
            # Apply pagination
            if start_after:
                doc_ref = self.collection.document(start_after)
                doc = doc_ref.get()
                if doc.exists:
                    query = query.start_after(doc)
                    
            query = query.limit(limit)
            docs = query.stream()
            return [Activity.from_dict(doc.id, doc.to_dict()) for doc in docs]
        except Exception as e:
            raise FirestoreError(f"Failed to list activities by creator: {str(e)}")
    
    def search_activities(self, filters: Dict) -> List[Activity]:
        """
        Search for activities based on given criteria.
        
        Args:
            filters: Dictionary of filter criteria
            
        Returns:
            List of Activity objects that match the criteria
        """
        query = self.collection
        
        # Start with a base query for non-expired, non-cancelled activities unless specified
        if "status" in filters:
            query = query.where("status", "==", filters["status"])
        else:
            # Default: Only show available activities
            query = query.where("status", "==", ActivityStatus.AVAILABLE.value)
        
        # Filter by sport
        if "sport" in filters:
            query = query.where("sport", "==", filters["sport"])
        
        # Filter by skill level
        if "skillLevel" in filters:
            query = query.where("skillLevel", "==", filters["skillLevel"])
        
        # Filter by activity type
        if "type" in filters:
            query = query.where("type", "==", filters["type"])
        
        # Filter by dateTime range
        if "dateFrom" in filters:
            date_from = filters["dateFrom"]
            query = query.where("dateTime", ">=", date_from)
        
        if "dateTo" in filters:
            date_to = filters["dateTo"]
            query = query.where("dateTime", "<=", date_to)
        
        # Get results
        results = query.limit(filters.get("limit", 50)).get()
        
        # Convert to Activity objects
        activities = [Activity.from_dict(doc.id, doc.to_dict()) for doc in results]
        
        # Post-processing filters (these can't be done efficiently in Firestore queries)
        filtered_activities = activities
        
        # Text search in name and description
        if "query" in filters and filters["query"]:
            query_terms = filters["query"].lower().split()
            filtered_activities = []
            for activity in activities:
                activity_text = (f"{activity.activityName} {activity.description} "
                                f"{activity.sport} {activity.placeName}").lower()
                if all(term in activity_text for term in query_terms):
                    filtered_activities.append(activity)
        
        # Filter by place name (case-insensitive contains)
        if "placeName" in filters and filters["placeName"]:
            place_query = filters["placeName"].lower()
            filtered_activities = [
                a for a in filtered_activities 
                if place_query in a.placeName.lower()
            ]
        
        # Filter by location proximity
        if "location" in filters and "maxDistance" in filters:
            center_lat = filters["location"]["latitude"]
            center_lng = filters["location"]["longitude"]
            max_distance = filters["maxDistance"]
            
            # Define a function to calculate distance
            def calculate_distance(lat1, lon1, lat2, lon2):
                # Haversine formula for calculating distance between two points on Earth
                R = 6371  # Earth radius in kilometers
                
                # Convert latitude and longitude from degrees to radians
                lat1_rad = math.radians(lat1)
                lon1_rad = math.radians(lon1)
                lat2_rad = math.radians(lat2)
                lon2_rad = math.radians(lon2)
                
                # Differences
                dlat = lat2_rad - lat1_rad
                dlon = lon2_rad - lon1_rad
                
                # Haversine formula
                a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
                distance = R * c
                
                return distance
            
            # Filter activities by distance
            filtered_activities = [
                a for a in filtered_activities 
                if calculate_distance(
                    center_lat, 
                    center_lng, 
                    a.get_location_as_object().latitude, 
                    a.get_location_as_object().longitude
                ) <= max_distance
            ]
        
        return filtered_activities
    
    def get_activities_by_participants(self, user_id: str) -> List[Activity]:
        """
        Retrieves all activities where the given user is a participant.
        
        Args:
            user_id (str): The user's ID.
            
        Returns:
            List[Activity]: Activities where the user is a participant.
        """
        try:
            query = self.collection.where("participants", "array_contains", user_id)
            docs = query.stream()
            return [Activity.from_dict(doc.id, doc.to_dict()) for doc in docs]
        except Exception as e:
            raise FirestoreError(f"Failed to get activities by participant: {str(e)}")
    
    def get_pending_join_requests(self, user_id: str) -> List[Activity]:
        """
        Retrieves all activities where the given user has a pending join request.
        
        Args:
            user_id (str): The user's ID.
            
        Returns:
            List[Activity]: Activities with pending join requests from user.
        """
        try:
            query = self.collection.where("joinRequests", "array_contains", user_id)
            docs = query.stream()
            return [Activity.from_dict(doc.id, doc.to_dict()) for doc in docs]
        except Exception as e:
            raise FirestoreError(f"Failed to get pending join requests: {str(e)}")
        
    def get_activities_with_pending_requests(self, creator_id: str) -> List[Activity]:
        """
        Retrieves all activities created by a user that have pending join requests.
        
        Args:
            creator_id (str): The creator's user ID.
            
        Returns:
            List[Activity]: Activities with pending join requests.
        """
        try:
            # Get activities where the user is the creator
            query = self.collection.where("creator_id", "==", creator_id)
            # Only include activities with at least one join request
            query = query.where("joinRequests", "!=", [])
            docs = query.stream()
            return [Activity.from_dict(doc.id, doc.to_dict()) for doc in docs]
        except Exception as e:
            raise FirestoreError(f"Failed to get activities with pending requests: {str(e)}")
    
    def expire_activities(self) -> Tuple[int, int]:
        """
        Mark activities as EXPIRED if their dateTime is in the past.
        
        Returns:
            tuple: (number_processed, number_expired)
        """
        try:
            # Get activities that are still marked as AVAILABLE
            query = self.collection.where("status", "==", ActivityStatus.AVAILABLE.value)
            docs = query.stream()
            
            batch = self.db.batch()
            processed = 0
            expired = 0
            
            now = datetime.now()
            for doc in docs:
                processed += 1
                data = doc.to_dict()
                
                # Check if dateTime is in the past
                date_time = data.get("dateTime")
                if isinstance(date_time, dict) and "seconds" in date_time:
                    date_time = datetime.fromtimestamp(date_time["seconds"])
                
                if date_time < now:
                    # Update status to EXPIRED
                    doc_ref = self.collection.document(doc.id)
                    batch.update(doc_ref, {"status": ActivityStatus.EXPIRED.value})
                    expired += 1
            
            # Execute batch update
            if expired > 0:
                batch.commit()
                
            return processed, expired
        except Exception as e:
            raise FirestoreError(f"Failed to expire activities: {str(e)}")
    
    def update_activity_with_transaction(self, activity_id: str, update_func) -> Activity:
        """
        Updates an activity atomically using a transaction.
        
        Args:
            activity_id (str): The activity document ID.
            update_func (callable): Function that takes the activity and returns updated data.
                                Signature: update_func(activity: Activity) -> dict
        
        Returns:
            Activity: The updated Activity object.
        """
        try:
            transaction = self.db.transaction()
            
            @firestore.transactional
            def update_in_transaction(transaction, activity_id):
                doc_ref = self.collection.document(activity_id)
                doc = doc_ref.get(transaction=transaction)
                if not doc.exists:
                    raise HTTPException(status_code=404, detail="Activity not found")
                
                # Create activity from document
                activity_data = doc.to_dict()
                activity = Activity.from_dict(doc.id, activity_data)
                
                # Get update data from the provided function
                update_data = update_func(activity)
                
                if update_data:
                    transaction.update(doc_ref, update_data)
                    
                    # IMPORTANT: Apply the same updates to our local copy instead of reading again
                    activity_data.update(update_data)
                
                # Return the locally updated activity instead of reading again
                return Activity.from_dict(doc.id, activity_data)
            
            return update_in_transaction(transaction, activity_id)
        except Exception as e:
            raise FirestoreError(f"Transaction failed for activity {activity_id}: {str(e)}")