import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Alert as AlertType } from '@/types/alert';
import { format, formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/hooks/ThemeContext';
import { useRouter } from 'expo-router';

interface AlertCardProps {
  alert: AlertType;
  onPress: (alert: AlertType) => void;
  onAccept?: (alert: AlertType) => void;
  onReject?: (alert: AlertType) => void;
  isProcessing?: boolean;
  processingAlertId?: string | null;
  // Add response status map to track responses
  responseStatusMap?: Record<string, 'accepted' | 'rejected'>;
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onPress,
  onAccept,
  onReject,
  isProcessing,
  processingAlertId,
  responseStatusMap = {}
}) => {
  const { colors } = useTheme();
  const router = useRouter();
  
  // Format the date/time for display
  const formatAlertTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else {
        return format(date, 'MMM d, yyyy • h:mm a');
      }
    } catch (e) {
      return 'Unknown time';
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = () => {
    switch(alert.type) {
      case 'join_request': 
        return <Ionicons name="person-add" size={24} color="#42c8f5" />;
      case 'request_approved': 
        return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
      case 'request_rejected': 
        return <Ionicons name="close-circle" size={24} color="#F44336" />;
      case 'user_left': 
        return <Ionicons name="exit" size={24} color="#FF9800" />;
      case 'user_removed':
        return <Ionicons name="person-remove" size={24} color="#F44336" />;
      case 'activity_cancelled': 
        return <Ionicons name="trash" size={24} color="#F44336" />;
      case 'activity_updated': 
        return <Ionicons name="refresh-circle" size={24} color="#42c8f5" />;
      case 'new_message': 
        return <Ionicons name="chatbubble" size={24} color="#9C27B0" />;
      default: 
        return <Ionicons name="notifications" size={24} color="#757575" />;
    }
  };

  const isJoinRequest = alert.type === 'join_request';
  const isProcessingThis = isProcessing && processingAlertId === alert.id;
  
  // Check if this alert has a response status
  const responseStatus = responseStatusMap[alert.id];
  const hasResponse = !!responseStatus;
  
  // Handler for profile image click - navigate to user profile
  const handleProfileClick = () => {
    if (alert.sender_id) {
      router.push(`/PublicProfile?id=${alert.sender_id}`);
    }
  };
  
  // Handler for alert body click
  const handleAlertBodyClick = () => {
    // For all alert types, allow navigating to the activity
    if (alert.activity_id) {
      router.push(`/ActivityDetail?id=${alert.activity_id}`);
    } else if (alert.sender_id && alert.type === 'new_message') {
      // Navigate to message thread when implemented
      // router.push(`/Messages?userId=${alert.sender_id}`);
    }
  };
  
  // Response status UI for accepted/rejected requests
  const renderResponseStatus = () => {
    if (!responseStatus) return null;
    
    if (responseStatus === 'accepted') {
      return (
        <View style={styles.responseStatusContainer}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={[styles.responseStatusText, { color: "#4CAF50" }]}>
            You accepted this request
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.responseStatusContainer}>
          <Ionicons name="close-circle" size={16} color="#F44336" />
          <Text style={[styles.responseStatusText, { color: "#F44336" }]}>
            You rejected this request
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={[
      styles.notificationItem,
      !alert.read && styles.unreadNotification,
      responseStatus === 'accepted' && styles.acceptedNotification,
      responseStatus === 'rejected' && styles.rejectedNotification,
      { backgroundColor: colors.card, borderColor: colors.border }
    ]}>
      {/* Profile image - clickable to view user profile */}
      <TouchableOpacity 
        onPress={handleProfileClick}
        disabled={!alert.sender_id || isProcessingThis}
        style={styles.profileImageContainer}
        activeOpacity={0.7}
      >
        {alert.sender_profile_pic ? (
          <Image 
            source={{ uri: alert.sender_profile_pic }} 
            style={styles.senderImage}
          />
        ) : (
          <View style={styles.iconContainer}>
            {getNotificationIcon()}
          </View>
        )}
      </TouchableOpacity>
      
      {/* Main content area - clickable to view activity details */}
      <TouchableOpacity
        style={styles.contentTouchable}
        onPress={handleAlertBodyClick}
        disabled={isProcessingThis || (!alert.activity_id && alert.type !== 'new_message')}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <Text style={[
            styles.notificationMessage,
            !alert.read && styles.boldText,
            { color: colors.text }
          ]}>
            {alert.message}
          </Text>
          
          <Text style={[styles.notificationTime, { color: colors.smalltext }]}>
            {formatAlertTime(alert.created_at)}
          </Text>
          
          {/* Show response status if available */}
          {hasResponse && renderResponseStatus()}
          
          {/* Action buttons for join requests - only if no response yet */}
          {isJoinRequest && onAccept && onReject && !hasResponse && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => onAccept(alert)}
                disabled={isProcessingThis}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => onReject(alert)}
                disabled={isProcessingThis}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      {!alert.read && <View style={styles.unreadDot} />}
      
      {isProcessingThis && (
        <View style={styles.processingOverlay}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#ffffff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#e6f7ff',
    borderColor: '#b3e5fc',
  },
  acceptedNotification: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light green background
    borderColor: '#4CAF50',
  },
  rejectedNotification: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)', // Light red background
    borderColor: '#F44336',
  },
  profileImageContainer: {
    marginRight: 14,
  },
  contentTouchable: {
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  senderImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  responseStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  responseStatusText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 6,
    fontWeight: '500',
  },
  navigationHintsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  navigationHint: {
    fontSize: 12,
    fontStyle: 'italic',
    marginRight: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#42c8f5',
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  rejectButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default AlertCard;