import { View, Button, StyleSheet, ImageBackground } from 'react-native';

export default function HomeScreen() {
  return (
    <ImageBackground
      source={require('@/assets/images/landingpage.png')}
      style={styles.background}
    > 
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button 
            title="Sign Up" 
            onPress={() => {}} 
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
    marginTop: 50,
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 600,
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
