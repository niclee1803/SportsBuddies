export type AlertType = 
  | "join_request" 
  | "request_approved" 
  | "request_rejected" 
  | "user_left"
  | "activity_cancelled"
  | "activity_updated"
  | "new_message";

export interface Alert {
  id: string;
  user_id: string;
  type: AlertType;
  message: string;
  activity_id?: string;
  activity_name?: string;
  sender_id?: string;
  sender_name?: string;
  sender_profile_pic?: string;
  created_at: string; // ISO string
  read: boolean;
  data?: Record<string, any>;
}