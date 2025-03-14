import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Template from '../components/Template'; 

const Profile = () => {
  return (
    <Template>
      <View style={styles.container}>
        <Text style={styles.text}>Profile Page</Text>
      </View>
    </Template>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});

export default Profile;
