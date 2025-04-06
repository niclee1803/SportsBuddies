import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/ThemeContext';
import { API_URL } from '@/config.json';
import Avatar from '@/components/activity/Avatar';
import { format } from 'date-fns';
import { showAlert } from '@/utils/alertUtils';

interface Message {
  id: string;
  activity_id: string;
  sender_id: string;
  sender_name: string;
  sender_profile_pic?: string;
  content: string;
  created_at: string;
}

const ActivityThread = () => {
  const { id: activityId } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await fetch(`${API_URL}/user/current_user`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setCurrentUserId(userData.id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async (isRefreshing = false) => {
    if (!activityId) return;

    if (isRefreshing) {
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

      // Fetch activity details to get the name
      const activityResponse = await fetch(`${API_URL}/activity/${activityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!activityResponse.ok) {
        throw new Error('Failed to fetch activity details');
      }
      
      const activityData = await activityResponse.json();
      setActivityName(activityData.name || 'Activity Thread');

      // Fetch messages for the activity
      const messagesResponse = await fetch(`${API_URL}/activity/${activityId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!messagesResponse.ok) {
        const errorData = await messagesResponse.json();
        throw new Error(errorData.detail || 'Failed to fetch messages');
      }

      const messagesData = await messagesResponse.json();
      setMessages(messagesData);
      setError(null);

    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activityId, router]);

  useEffect(() => {
    if (activityId) {
      fetchMessages();
    }
  }, [activityId, fetchMessages]);

  // Send message function
  const sendMessage = async () => {
    if (!newMessage.trim() || !activityId) return;

    setSending(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/Login');
        return;
      }

      const response = await fetch(`${API_URL}/activity/${activityId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send message');
      }

      const messageData = await response.json();
      
      // Add the new message to the list
      setMessages(prevMessages => [...prevMessages, messageData]);
      
      // Clear the input
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
      showAlert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send message'
      );
    } finally {
      setSending(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
    } catch (e) {
      return 'Unknown time';
    }
  };

  // Message item renderer
  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender_id === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}
      >
        {!isCurrentUser && (
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => router.push(`/PublicProfile?id=${item.sender_id}`)}
          >
            <Avatar
              size={36}
              uri={item.sender_profile_pic}
              name={item.sender_name}
            />
          </TouchableOpacity>
        )}
        
        <View
          style={[
            styles.messageBubble,
            isCurrentUser
              ? [styles.currentUserBubble, { backgroundColor: colors.primary }]
              : [styles.otherUserBubble, { backgroundColor: colors.card }]
          ]}
        >
          {!isCurrentUser && (
            <Text style={[styles.senderName, { color: colors.secondary }]}>
              {item.sender_name}
            </Text>
          )}
          
          <Text
            style={[
              styles.messageText,
              { color: isCurrentUser ? 'white' : colors.text }
            ]}
          >
            {item.content}
          </Text>
          
          <Text
            style={[
              styles.messageTime,
              { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.smalltext }
            ]}
          >
            {formatDate(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {activityName}
            </Text>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => router.push(`/ActivityDetail?id=${activityId}`)}
            >
              <Ionicons name="information-circle-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Messages List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Loading messages...
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
                onPress={() => fetchMessages()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.messagesList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchMessages(true)}
                  colors={["#42c8f5"]}
                  tintColor="#42c8f5"
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
                  <Text style={[styles.emptyText, { color: colors.smalltext }]}>
                    No messages yet. Start the conversation!
                  </Text>
                </View>
              }
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
          )}

          {/* Message Input */}
          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text }
              ]}
              placeholder="Type a message..."
              placeholderTextColor={colors.smalltext}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: colors.primary },
                (!newMessage.trim() || sending) && styles.disabledButton
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={18} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    padding: 16,
    borderBottomColor: '#eaeaea',
    borderBottomWidth: 1
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center'
  },
  infoButton: {
    padding: 8
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 12
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%'
  },
  currentUserMessage: {
    alignSelf: 'flex-end'
  },
  otherUserMessage: {
    alignSelf: 'flex-start'
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end'
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%'
  },
  currentUserBubble: {
    borderBottomRightRadius: 2
  },
  otherUserBubble: {
    borderBottomLeftRadius: 2
  },
  senderName: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2
  },
  messageText: {
    fontSize: 15,
    marginBottom: 4
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  disabledButton: {
    opacity: 0.5
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic'
  }
});

export default ActivityThread;