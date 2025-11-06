import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
} from "react-native";
import { useEffect } from "react";
export default function WelcomeScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate("Onboard1");
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);
  return (
    <ImageBackground
      source={require("../assets/WelcomeBg.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}></View>

      <View style={styles.container}>
        <Text style={styles.title}>Welcome back</Text>

        <Image
          source={require("../assets/Axon ERP.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 30,
    lineHeight: 48,
    letterSpacing: -2,
    fontWeight: "semibold",
    color: "#2F60AF",
    alignItems: "center",
  },

  logo: {
    width: 213.22,
    height: 46.98,
    marginBottom: 30,
  },
});
