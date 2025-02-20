import { StyleSheet, ImageBackground } from 'react-native';

export default function LoadingScreen() {
  return (
    <ImageBackground
      source={require('@/assets/images/loadingpage.png')}
      style={styles.background}
    >
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    marginBottom: 80,
  }
});
