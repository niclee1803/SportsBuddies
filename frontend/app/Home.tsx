import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Template from '../components/Template'; 

const Home = () => {
  return (
    <Template>
      <View style={styles.container}>
        <Text style={styles.text}>Home Page</Text>
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

export default Home;
