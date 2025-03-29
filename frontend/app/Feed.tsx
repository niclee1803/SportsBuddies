import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AuthLayout from '@/components/AuthLayout';

const Feed = () => {
  const [loading, setLoading] = useState(false);
  
  // Placeholder data for the feed
  const placeholderActivities = [
    { id: '1', title: 'Basketball Game', date: '2:00 PM Today', location: 'Central Park' },
    { id: '2', title: 'Tennis Match', date: '4:30 PM Tomorrow', location: 'City Sports Center' },
    { id: '3', title: 'Running Group', date: '7:00 AM Saturday', location: 'Riverside Track' },
    { id: '4', title: 'Swimming Class', date: '10:00 AM Sunday', location: 'Community Pool' },
  ];

  return (
    <AuthLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Activity Feed (Not done)</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#42c8f5" style={styles.loader} />
        ) : (
          <FlatList
            data={placeholderActivities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.activityCard}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDetail}>{item.date}</Text>
                <Text style={styles.activityDetail}>{item.location}</Text>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
          />
        )}
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
  loader: {
    marginTop: 40,
  },
  listContainer: {
    paddingBottom: 80, // For bottom nav space
  },
  activityCard: {
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
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  activityDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default Feed;