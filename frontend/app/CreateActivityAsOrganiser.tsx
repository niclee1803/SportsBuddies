import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Template from '../components/Template';
import { HeaderBackButton } from '@react-navigation/elements'; 
import { useNavigation } from '@react-navigation/native'; 
import * as ImagePicker from 'expo-image-picker';  // Import ImagePicker
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs, Firestore} from 'firebase/firestore';
import { app } from '../constants/firebaseConfig';  
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker'; // Import DropDownPicker
import DateTimePicker from "@react-native-community/datetimepicker";
//import firestore from '@react-native-firebase/firestore'




const CreateActivityAsOrganiser = () => {
    const navigation = useNavigation();
    const auth = getAuth(app);
    const db = getFirestore(app);

     
    const [activityName, setActivityName] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [activityDate, setActivityDate] = useState(new Date());
    const [activityTime, setActivityTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [bannerUri, setBannerUri] = useState<string | null>(null);

    const [sports, setSports] = useState<string[]>([]); //empty array of sports
    const [skillLevels, setSkillLevels] = useState<string[]>([]);
    const [visibilityOptions, setVisibilityOptions] = useState<string[]>([]);

    const [selectedSport, setSelectedSport] = useState<string | null>(null);
    const [selectedSkillLevel, setSelectedSkillLevel] = useState<string | null>(null);
    const [selectedVisibility, setSelectedVisibility] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    

    //fetching data
    useEffect(() => {
      const subscriber=firestore()
        .collection
  
  }, []);







  
      const onDateChange = (_: any, selectedDate: Date | undefined) => {
        setShowDatePicker(false);
        setActivityDate(selectedDate || activityDate);
      };
      
      const onTimeChange = (_: any, selectedTime: Date | undefined) => {
        setShowDatePicker(false);
        setActivityDate(selectedTime || activityDate);
      };

      const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.granted) {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
      
          if (!result.canceled && result.assets && result.assets.length > 0) {
            setBannerUri(result.assets[0].uri);
          }
        } else {
          Alert.alert('Permission Denied', 'You need to grant access to your media library to select an event banner.', [{ text: 'OK' }]);
        }
      };

      const cancelUpload = () => {
        setBannerUri(null);  // Reset the banner URI
      };
    
   
    return (
        <Template>
          <ThemedView style={styles.container}>
            <View style={styles.header}>
              <HeaderBackButton onPress={() => navigation.goBack()} />
              <ThemedText type="title" style={styles.title}>Create Activity as Organiser</ThemedText>
            </View>

            <View style={styles.insidecontainer}>
                <TextInput style={styles.input} placeholder="Activity Name" value={activityName} onChangeText={setActivityName} />
                <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
                <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
                <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                    <ThemedText type="defaultSemiBold">{activityDate.toDateString()}</ThemedText>
                </TouchableOpacity>
                        
                {showDatePicker && (
                    <DateTimePicker value={activityDate} mode="date" display="default" onChange={onDateChange} />
                )}

                <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
                    <ThemedText type="defaultSemiBold">{activityTime.toLocaleTimeString()}</ThemedText>
                </TouchableOpacity>
                
                {showTimePicker && (
                    <DateTimePicker value={activityTime} mode="time" display="default" onChange={onTimeChange} />
                )}

                <TouchableOpacity style={styles.bannerContainer} onPress={pickImage}>
                <ThemedText type="defaultSemiBold">Insert Event Banner</ThemedText>
                {bannerUri ? (
                    <Text>Inserted: {bannerUri.split('/').pop()}</Text>
                ) : (
                    <ThemedText type="default">Tap to select a banner</ThemedText>
                )}
                </TouchableOpacity>

                {bannerUri && <Image source={{ uri: bannerUri }} style={styles.image} />}
                <TouchableOpacity onPress={cancelUpload}><Text>Cancel Upload</Text></TouchableOpacity>

                {/* Dropdown for Sports */}
                <DropDownPicker
                open={false}
                value={selectedSport}
                items={sports.map(sport => ({ label: sport, value: sport }))}
                setOpen={() => {}}
                setValue={setSelectedSport}
                placeholder="Select a sport"
                containerStyle={styles.input}
                />

                  {/* Dropdown for Visibility */}
                <DropDownPicker
                open={false}
                value={selectedVisibility}
                items={visibilityOptions.map(option => ({ label: option, value: option }))}
                setOpen={() => {}}
                setValue={setSelectedVisibility}
                placeholder="Select visibility"
                containerStyle={styles.input}
                />

                {/* Dropdown for Skill Level */}
                <DropDownPicker
                open={false}
                value={selectedSkillLevel}
                items={skillLevels.map(level => ({ label: level, value: level }))}
                setOpen={() => {}}
                setValue={setSelectedSkillLevel}
                placeholder="Select skill level"
                containerStyle={styles.input}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={() => console.log('Activity Created')}>
                    <ThemedText type="defaultSemiBold" style={styles.buttonText}>Upload Activity</ThemedText>
            </TouchableOpacity>
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
    },
    insidecontainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width:'100%'
       
      },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 30,
      width: '100%',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      flex: 1,
    },
    input: {
      width: '100%',
      height: 40,
      borderColor: 'black',
      borderWidth: 1,
      marginBottom: 15,
      paddingLeft: 10,
    },
    bannerContainer: {
      width: '100%',
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 20,
    },
    image: {
      width: '100%',
      height: 200,
      marginTop: 10,
      borderRadius: 10,
    },
    button: {
      backgroundColor: '#87CEFA',
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 18,
    },
  });
  
  export default CreateActivityAsOrganiser;