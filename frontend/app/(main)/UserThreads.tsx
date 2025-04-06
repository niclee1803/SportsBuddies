import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config.json';
import AuthLayout from '@/components/AuthLayout';
import { useTheme } from '@/hooks/ThemeContext';
import { format, isToday, isYesterday } from 'date-fns';

interface ActivityThread {
  id: string;
  activityName: string;
  latestMessage?: {
    sender_name: string;
    content: string;
    created_at: string;
  };
  unreadCount: number;
  type: string;
  dateTime: string;
  sport: string;
  isCreator: boolean;
  placeName: string;
  participants: number;
  maxParticipants: number;
}

const UserThreads = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [threads, setThreads] = useState<ActivityThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all activities where the user is a participant or creator
  const fetchThreads = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/Login');
        return;
      }
      
      // Get activities created by the user
      const createdResponse = await fetch(`${API_URL}/activity/my/created`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      // Get activities joined by the user
      const participatingResponse = await fetch(`${API_URL}/activity/my/participating`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (!createdResponse.ok || !participatingResponse.ok) {
        throw new Error('Failed to fetch activities');
      }

      const createdActivities = await createdResponse.json();
      const participatingActivities = await participatingResponse.json();
      
      // Combine and mark which ones the user created
      const allActivities = [
        ...createdActivities.map((act: any) => ({
          ...act,
          isCreator: true,
          unreadCount: act.unread_messages || 0
        })),
        ...participatingActivities.map((act: any) => ({
          ...act, 
          isCreator: false,
          unreadCount: act.unread_messages || 0
        }))
      ];

      // For each activity, fetch the latest message if available
      const activitiesWithMessages = await Promise.all(
        allActivities.map(async (activity: any) => {
          try {
            const messagesResponse = await fetch(`${API_URL}/activity/${activity.id}/messages?limit=1`, {
              headers: {
                Authorization: `Bearer ${token}`,
              }
            });
            
            if (messagesResponse.ok) {
              const messages = await messagesResponse.json();
              return {
                ...activity,
                latestMessage: messages.length > 0 ? messages[0] : undefined
              };
            }
            return activity;
          } catch (err) {
            console.error("Error fetching messages for activity:", activity.id, err);
            return activity;
          }
        })
      );
      
      // Sort activities by latest message, then by date
      const sortedActivities = activitiesWithMessages.sort((a, b) => {
        if (a.latestMessage && b.latestMessage) {
          return new Date(b.latestMessage.created_at).getTime() - new Date(a.latestMessage.created_at).getTime();
        } else if (a.latestMessage) {
          return -1;
        } else if (b.latestMessage) {
          return 1;
        }
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      });
      
      setThreads(sortedActivities);
      setError(null);
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError('Failed to load your conversations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchThreads();
    }, [fetchThreads])
  );

  // Handle pull-to-refresh
  const handleRefresh = () => {
    fetchThreads(true);
  };

  // Navigate to a thread
  const handleOpenThread = (threadId: string) => {
    router.push(`/ActivityThread?id=${threadId}`);
  };

  // Format the message date
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  // Render each thread item
  const renderThreadItem = ({ item }: { item: ActivityThread }) => {
    const isPastActivity = new Date(item.dateTime) < new Date();
    
    return (
      <TouchableOpacity
        style={[
          styles.threadItem,
          { backgroundColor: colors.card }
        ]}
        onPress={() => handleOpenThread(item.id)}
        activeOpacity={0.7}
      >
        {/* Activity type indicator (event/coaching) and sport icon */}
        <View style={[
          styles.typeIndicator,
          { backgroundColor: item.type === 'event' ? '#5cb85c' : '#f0ad4e' }
        ]}>
          <Text style={styles.typeText}>{item.type === 'event' ? 'E' : 'C'}</Text>
        </View>

        <View style={styles.threadContent}>
          {/* Activity name and unread count */}
          <View style={styles.threadHeader}>
            <Text 
              style={[styles.threadName, { color: colors.text }]} 
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.activityName}
            </Text>
            
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>

          {/* Latest message or activity info */}
          <View style={styles.messageRow}>
            {item.latestMessage ? (
              <>
                <Text 
                  style={[
                    styles.messageSender, 
                    { color: item.unreadCount > 0 ? colors.primary : colors.text }
                  ]}
                  numberOfLines={1}
                >
                  {item.latestMessage.sender_name}:
                </Text>
                <Text 
                  style={[
                    styles.messagePreview, 
                    { color: item.unreadCount > 0 ? colors.text : colors.smalltext }
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.latestMessage.content}
                </Text>
              </>
            ) : (
              <Text 
                style={[styles.messagePreview, { color: colors.smalltext, fontStyle: 'italic' }]}
                numberOfLines={1}
              >
                No messages yet
              </Text>
            )}
          </View>

          {/* Activity details */}
          <View style={styles.activityDetails}>
            <Text style={[styles.activityInfo, { color: colors.smalltext }]}>
              {item.sport} • {item.placeName && item.placeName.length > 25 
                ? item.placeName.substring(0, 22) + '...' 
                : item.placeName}
            </Text>
            
            <Text style={[styles.activityInfo, { color: colors.smalltext }]}>
    {Array.isArray(item.participants) ? item.participants.length : 0}/{item.maxParticipants} participants
  </Text>
          </View>
        </View>

        {/* Date/time and status indicators */}
        <View style={styles.threadMeta}>
          {item.latestMessage && (
            <Text style={[styles.messageTime, { color: colors.smalltext }]}>
              {formatMessageDate(item.latestMessage.created_at)}
            </Text>
          )}
          
          {/* Status badges */}
          <View style={styles.statusBadges}>
            {item.isCreator && (
              <Ionicons name="star" size={14} color="#42c8f5" style={styles.statusIcon} />
            )}
            {isPastActivity && (
              <Ionicons name="time-outline" size={14} color="#ff9800" style={styles.statusIcon} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <AuthLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.title, { color: colors.text }]}>Activity Threads</Text>
          
          <View style={styles.placeholderButton} />
        </View>

        {/* Content */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading your conversations...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
            <Text style={[styles.errorText, { color: colors.text }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={() => fetchThreads()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={threads}
            renderItem={renderThreadItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#42c8f5"]}
                tintColor="#42c8f5"
              />
            }
            contentContainerStyle={[
              styles.listContent,
              threads.length === 0 && styles.emptyListContent
            ]}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  No conversations found
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.smalltext }]}>
                  Join or create activities to start chatting!
                </Text>
                <TouchableOpacity
                  style={[styles.createButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/Feed')}
                >
                  <Text style={styles.createButtonText}>Find Activities</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholderButton: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  createButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  threadItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  typeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    alignSelf: 'center',
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  threadContent: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  threadName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#42c8f5',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  messagePreview: {
    fontSize: 14,
    flex: 1,
  },
  activityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  activityInfo: {
    fontSize: 12,
    marginRight: 8,
  },
  threadMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 10,
    minWidth: 60,
  },
  messageTime: {
    fontSize: 12,
    marginBottom: 8,
  },
  statusBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginLeft: 4,
  },
});

export default UserThreads;