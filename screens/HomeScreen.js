import React, { useState } from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image } from "react-native";
import { ArrowUpRight, Bell, Eye, EyeOff } from "lucide-react-native";

export default function HomeScreen() {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <View>
      <ImageBackground
        source={require("../assets/EllipseHome.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Header */}
        <View style={styles.container}>

          {/* Profile */}
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=12" }}
              style={styles.profileImage}
            />
            <View style={styles.textContainer}>
              <Text style={styles.name}>Hello, Justin</Text>
              <Text style={styles.welcome}>Welcome back</Text>
            </View>
          </View>

          {/* Bell & Hide/Show Balance Icons */}
          <View style={styles.iconRow}>
            <TouchableOpacity style={styles.bellContainer}>
              <Bell size={22} color="#000" />
            </TouchableOpacity>
          </View>

        </View>

        {/* Balance Section */}
        <View style={styles.balanceContainer}>
          <Text style={styles.baltitle}>BALANCE (Overall Sale)</Text>

            <TouchableOpacity style={styles.viewContainer} onPress={() => setShowBalance(!showBalance)}>
              {showBalance ? <EyeOff size={18} color="#ffffffff" /> : <Eye size={22} color="#1e00ffff" />}
            </TouchableOpacity>

          <Text style={styles.amount}>
            {showBalance ? "$25,430.00" : "*****"}
          </Text>

          <View style={styles.perfRow}>
            <View style={styles.arrowBox}>
              <ArrowUpRight size={12} color="#fff" />
            </View>
            <Text style={styles.avginc}>+200K</Text>
            <Text style={styles.avgSale}> in last 1 mon</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { width: "100%", height: 429.76 },

  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 12,
    top: 54,
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  bellContainer: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 50,
    elevation: 3,
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  textContainer: { flexDirection: "column" },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  welcome: {
    fontSize: 10,
    color: "#fff",
  },

  balanceContainer: {
    marginTop: 66,
    alignItems: "center",
  },

  baltitle: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
    fontWeight: "500",
  },

  amount: {
    fontSize: 38,
    color: "#fff",
    fontWeight: "700",
    marginTop: -18,
  },
   viewContainer: {
    left: 116,
    top: 6,
  },

  perfRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  arrowBox: {
    width: 18,
    height: 18,
    backgroundColor: "#63b466cc",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
    avginc: {
    fontSize: 10,
    color: "#fff",
    backgroundColor: "#63b466cc",
    fontWeight: "700",
  },

  avgSale: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "500",
  },
});