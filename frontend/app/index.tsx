import { View, TouchableOpacity, StyleSheet, ImageBackground, Text, StatusBar, Platform } from "react-native";
import "expo-router/entry";
import { Link, useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  const getBackgroundSource = () => {
    return Platform.OS === 'web' 
      ? require("@/assets/images/weblandingpage.png")
      : require("@/assets/images/landingpage.png");
  };

  return (
    <>
      {Platform.OS === 'android' && (
        <StatusBar translucent backgroundColor="transparent"  barStyle={"dark-content"} />
      )}
      {Platform.OS === 'ios' && (
        <StatusBar translucent backgroundColor="transparent" barStyle={"dark-content"} />
      )}
      <ImageBackground
        source={getBackgroundSource()}
        style={styles.background}
      >
        <View style={styles.container}>
          <Text style={styles.welcomeText}>Connect with other sports enthusiasts!</Text>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push("/SignUp")}
            >
              <Text style={styles.buttonText}>Get started</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.text}>
            <Text>Already have an account?</Text>
            <Link href="/Login">
              <Text style={{ color: "#0000ff" }}>Login</Text>
            </Link>
          </View>
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: "center",
    paddingBottom: 40,
    width: "100%",
  },
  welcomeText: {
    fontSize: Platform.OS === 'web' ? 32 : 25,
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 20,
    color: Platform.OS === 'web' ? '#333' : '#000',
  },
  buttonWrapper: {
    width: Platform.OS === 'web' ? '30%' : '50%',
    maxWidth: 400,
    height: 50,
    backgroundColor: "#000000",
    borderRadius: 20,
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 20,
  },
  text: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  button: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
  }
});