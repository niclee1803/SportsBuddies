import { Alert } from "@/types/alert";
import { API_URL } from "@/config.json";

export class AlertService {
  static async getAlerts(token: string, unreadOnly: boolean = false, limit: number = 50): Promise<Alert[]> {
    try {
      const response = await fetch(
        `${API_URL}/user/alerts?unread_only=${unreadOnly}&limit=${limit}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return [];
    }
  }

  static async getUnreadCount(token: string): Promise<number> {
    try {
      const response = await fetch(`${API_URL}/user/alerts/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch unread count: ${response.status}`);
      }

      const data = await response.json();
      return data.unread_count;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }

  static async markAsRead(token: string, alertId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/alerts/${alertId}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Error marking alert as read:", error);
      return false;
    }
  }

  static async markAllAsRead(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/alerts/read-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Error marking all alerts as read:", error);
      return false;
    }
  }

  static async deleteAlert(token: string, alertId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/alerts/${alertId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Error deleting alert:", error);
      return false;
    }
  }

  static async setResponseStatus(token: string, alertId: string, status: 'accepted' | 'rejected'): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/alerts/${alertId}/respond`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status })
      });
  
      return response.ok;
    } catch (error) {
      console.error(`Error setting alert response status to ${status}:`, error);
      return false;
    }
  }

  static async deleteAllAlerts(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/alerts`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response.ok;
    } catch (error) {
      console.error("Error deleting all alerts:", error);
      return false;
    }
  }
}