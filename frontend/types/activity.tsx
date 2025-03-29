export interface Location {
    latitude: number;
    longitude: number;
  }
  
  export interface Creator {
    id: string;
    name: string;
    profilePicUrl: string;
  }
  
  export interface Activity {
    id: string;
    activityName: string;
    bannerImageUrl?: string;
    type: string;
    price: number;
    sport: string;
    skillLevel: string;
    description: string;
    creator_id: string;
    creator?: Creator;
    location: Location;
    dateTime: string;
    participants: string[];
    joinRequests: string[];
    maxParticipants: number;
    status: string;
  }