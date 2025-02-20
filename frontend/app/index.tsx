import { View, Button, StyleSheet, ImageBackground } from 'react-native';
import 'expo-router/entry';
import { useRouter } from 'expo-router'

export default function HomeScreen() {
const router = useRouter();

  return (
    <ImageBackground
      source={require('@/assets/images/landingpage.png')}
      style={styles.background}
    > 
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button 
            title="Sign Up" 
            onPress={() => router.push('/signUp')}
            color="#000000" 
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button 
            title="Log In" 
            onPress={() => {}} 
            color="#000000" 
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
    marginTop: 0
  },
  buttonContainer: {
    marginTop: 700,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    width: '80%',
  },
  buttonWrapper: {
    flex: 0.45,
    backgroundColor: '#FFFFFF',
    borderRadius: 20
  }
});
