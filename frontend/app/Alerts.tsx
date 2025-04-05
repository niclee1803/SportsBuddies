import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthLayout from '@/components/AuthLayout';
import { AlertService } from '@/services/AlertService';
import { Alert as AlertType } from '@/types/alert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/ThemeContext';
import { API_URL } from '@/config.json';
import LoadingOverlay from '@/components/LoadingOverlay';
import AlertCard from '@/components/alert/AlertCard';

const Alerts = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingAlertId, setProcessingAlertId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch alerts from the API
  const fetchAlerts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.push('/Login');
        return;
      }
      
      const alertsData = await AlertService.getAlerts(token);
      console.log('Fetched alerts:', alertsData);
      setAlerts(alertsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  // Load alerts when component mounts
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Mark an alert as read and navigate to relevant screen
  const handleAlertPress = async (alert: AlertType) => {
    // Skip handling for join requests (we have separate buttons for those)
    if (alert.type === 'join_request') return;
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      
      // Mark as read in the background
      AlertService.markAsRead(token, alert.id);
      
      // Update UI immediately
      setAlerts(currentAlerts => 
        currentAlerts.map(a => 
          a.id === alert.id ? { ...a, read: true } : a
        )
      );
      
      // Navigate based on alert type
      if (alert.activity_id) {
        router.push(`/ActivityDetail?id=${alert.activity_id}`);
      } else if (alert.sender_id && alert.type === 'new_message') {
        // Navigate to message thread when implemented
        // router.push(`/Messages?userId=${alert.sender_id}`);
      }
    } catch (err) {
      console.error('Error handling alert press:', err);
    }
  };

  // Handle marking all alerts as read
  const handleMarkAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      
      const success = await AlertService.markAllAsRead(token);
      if (success) {
        // Update UI
        setAlerts(currentAlerts => 
          currentAlerts.map(a => ({ ...a, read: true }))
        );
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleAcceptRequest = async (alert: AlertType) => {
    if (!alert.activity_id || !alert.sender_id) return;
    
    setProcessingAlertId(alert.id);
    setIsProcessing(true);
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      
      // Call the API to approve the join request
      const response = await fetch(`${API_URL}/activity/${alert.activity_id}/approve/${alert.sender_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve request');
      }
      
      // Mark the alert as read
      await AlertService.markAsRead(token, alert.id);
      
      // Update local state - remove this alert from the list
      setAlerts(currentAlerts => 
        currentAlerts.filter(a => a.id !== alert.id)
      );
      
      // Optionally show success message
      console.log('Join request approved successfully');
      
    } catch (error) {
      console.error('Error approving join request:', error);
    } finally {
      setProcessingAlertId(null);
      setIsProcessing(false);
    }
  };
  
  const handleRejectRequest = async (alert: AlertType) => {
    if (!alert.activity_id || !alert.sender_id) return;
    
    setProcessingAlertId(alert.id);
    setIsProcessing(true);
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      
      // Call the API to reject the join request
      const response = await fetch(`${API_URL}/activity/${alert.activity_id}/reject/${alert.sender_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject request');
      }
      
      // Mark the alert as read
      await AlertService.markAsRead(token, alert.id);
      
      // Update local state - remove this alert from the list
      setAlerts(currentAlerts => 
        currentAlerts.filter(a => a.id !== alert.id)
      );
      
      // Optionally show success message
      console.log('Join request rejected successfully');
      
    } catch (error) {
      console.error('Error rejecting join request:', error);
    } finally {
      setProcessingAlertId(null);
      setIsProcessing(false);
    }
  };

  return (
    <AuthLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Global loading overlay */}
        <LoadingOverlay visible={isProcessing} />
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Alerts</Text>
          {alerts.some(alert => !alert.read) && (
            <TouchableOpacity 
              style={styles.markAllReadButton} 
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.markAllReadText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#42c8f5" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => fetchAlerts()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.notificationsContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchAlerts(true)}
                colors={["#42c8f5"]}
                tintColor="#42c8f5"
              />
            }
          >
            {alerts.length > 0 ? (
              alerts.map(alert => (
                <AlertCard 
                  key={alert.id}
                  alert={alert}
                  onPress={handleAlertPress}
                  onAccept={handleAcceptRequest}
                  onReject={handleRejectRequest}
                  isProcessing={isProcessing}
                  processingAlertId={processingAlertId}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  You have no notifications
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  markAllReadButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#42c8f5',
  },
  markAllReadText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  notificationsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#42c8f5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default Alerts;