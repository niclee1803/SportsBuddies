import React from 'react';
import { View, Text, StyleSheet,TouchableOpacity,Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Template from '../components/Template'; 
//import BackButton from '../components/backarrow'; 
import { HeaderBackButton } from '../node_modules/@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { useRouter, useFocusEffect } from 'expo-router';




const Create = () => {
  const navigation = useNavigation(); 
  const router = useRouter();
  const gotoCreateActivityAsOrganiser = () => {
    router.push('/CreateActivityAsOrganiser')
  };
  return (
    <Template>
    <ThemedView style={styles.container}>
      <View style={styles.header}>
          <HeaderBackButton  style={styles.backButton} onPress={() => navigation.goBack()} />
          <ThemedText type="title" style={styles.title}>
            Create Activity
          </ThemedText>
      </View>
      {/* Image and button for Organiser */}
      <View style={styles.buttonContainer}>
      <View style={styles.imageContainer}>
        <Image source={require('@/assets/images/organiser.png')} style={styles.image} />
        <TouchableOpacity style={styles.button} onPress={gotoCreateActivityAsOrganiser}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Create as Organiser
          </ThemedText>
        </TouchableOpacity>
      </View>
    

      {/* Image and button for Coach */}
      <View style={styles.imageContainer}>
        <Image source={require('@/assets/images/coach.png')} style={styles.image} />
        <TouchableOpacity style={styles.button} onPress={() => console.log('Create as Coach')}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Create as Coach
          </ThemedText>
        </TouchableOpacity>
      </View>
      </View>
    </ThemedView>
  </Template>
);

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor:'white'
  },
  header: {
    flexDirection: 'row',  // Place back button and title in a row
    alignItems: 'center',  // Align them vertically centered
    marginTop: 40,  // Space from top for the header
    marginBottom: 30,  // Space between header and other content
  },
  title: {
    marginTop:40,
    marginBottom: 30,
    textAlign: 'center',
    color:"black"
  },
  backButton: {
    padding: 10, // Adjust padding around the back button
    marginLeft: 10, // Add space from the left edge
    marginTop:10
  },
  buttonContainer: {
    flex:1,
    flexDirection: 'row', // Arrange children horizontally
    justifyContent: 'center', // Center the content horizontally
    alignItems: 'center', // Center the content vertically
    gap: 10, // Add space between the containers
  },
  button: {
    backgroundColor: '#87CEFA', // You can adjust the color as needed
    paddingVertical: 15,
    paddingHorizontal:10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40, // Space between images and buttons
  },
  image: {
    width: 200, // Adjust the width of the image
    height: 200, // Adjust the height of the image
    marginBottom: 20, // Space between the image and the button
  },
});

export default Create;
