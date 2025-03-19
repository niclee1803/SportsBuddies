import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import Template from '../components/Template';

const Friends = () => {
  type Friend = {
    id: string;
    name: string;
    username: string;
    profilePic?: string;
  };
  
  const [friends, setFriends] = useState<Friend[]>([]);
  
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        if (auth.currentUser) {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setFriends(data.friends || []); 
          } else {
            console.log('No such user document!');
          }
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch friends.');
      }
    };

    fetchFriends();
  }, []);

  return (
    <Template>
      <View style={styles.container}>
        <Text style={styles.header}>Your Friends</Text>
        
        {friends.length === 0 ? (
          <Text style={styles.noFriendsText}>You have no friends added yet.</Text>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id} 
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.friendItem}>
                <Image source={{ uri: item.profilePic || 'https://placehold.co/150' }} style={styles.friendImage} />
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{item.name}</Text>
                  <Text style={styles.friendUsername}>@{item.username}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Template>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  noFriendsText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  friendInfo: {
    flexDirection: 'column',
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendUsername: {
    color: 'gray',
  },
});

export default Friends;
