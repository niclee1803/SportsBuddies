import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthLayout from '@/components/AuthLayout';

const Alerts = () => {
  const [notifications, setNotifications] = useState([
    { 
      id: '1', 
      type: 'join_request', 
      message: 'John Smith wants to join your Basketball Game', 
      time: '2 hours ago', 
      read: false 
    },
    { 
      id: '2', 
      type: 'new_activity', 
      message: 'New tennis event near you!', 
      time: '5 hours ago', 
      read: true 
    },
    {
      id: '3',
      type: 'message',
      message: 'Sarah sent you a message about Football match',
      time: 'Yesterday',
      read: false
    },
    {
      id: '4',
      type: 'activity_update',
      message: 'Swimming class time has changed',
      time: '2 days ago',
      read: true
    },
  ]);

  // Function to mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? {...notif, read: true} : notif
    ));
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'join_request': return <Ionicons name="person-add" size={24} color="#42c8f5" />;
      case 'new_activity': return <Ionicons name="calendar" size={24} color="#4CAF50" />;
      case 'message': return <Ionicons name="chatbubble" size={24} color="#FF9800" />;
      case 'activity_update': return <Ionicons name="alert-circle" size={24} color="#F44336" />;
      default: return <Ionicons name="notifications" size={24} color="#757575" />;
    }
  };

  return (
    <AuthLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Notifications (Not done)</Text>
        
        <ScrollView contentContainerStyle={styles.notificationsContainer}>
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadNotification
                ]}
                onPress={() => markAsRead(notification.id)}
              >
                <View style={styles.iconContainer}>
                  {getNotificationIcon(notification.type)}
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noNotifications}>
              You have no notifications
            </Text>
          )}
        </ScrollView>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 40,
  },
  notificationsContainer: {
    paddingBottom: 80,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#757575',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#42c8f5',
    marginLeft: 8,
  },
  noNotifications: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
});

export default Alerts;