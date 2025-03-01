import { View, Button, StyleSheet, ImageBackground, Text } from "react-native";
import "expo-router/entry";
import { Link, useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("@/assets/images/landingpage.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Connect with other sports enthusiasts!</Text>
        <View style={styles.buttonWrapper}>
          <Button
            title="Get started"
            onPress={() => router.push("/SignUp")}
            color="#ffffff"
          />
        </View>
        <View style={styles.text}>
          <Text>Already have an account?</Text>
          <Link href="/Login">
            <Text style={{ color: "#0000ff" }}>Login</Text>
          </Link>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    alignItems: "center",
    marginTop: 0,
  },
  container: {
    marginTop: 450,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "100%",
    gap: 20,
  },
  welcomeText: {
    fontFamily: "San Francisco",
    fontSize: 25,
    marginBottom: 100,
    textAlign: "center",
  },
  buttonWrapper: {
    width: "70%",
    height: 50,
    backgroundColor: "#000000",
    borderRadius: 20,
    justifyContent: "center",
  },
  text: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  }
});
