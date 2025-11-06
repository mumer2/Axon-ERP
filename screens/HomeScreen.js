import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";
import { ArrowUpRight, Bell, Eye, EyeOff } from "lucide-react-native";
import OtherReports from "./OtherReports";
import RecentActivitySection from "./RecentActivitySection";

export default function HomeScreen({ navigation }) {
  const [showBalance, setShowBalance] = useState(true);

  const menu = [
    {
      title: "Order Booking",
      icon: (
        <Image
          source={require("../assets/Icons/OrderBooking.png")}
          style={styles.icon}
        />
      ),
    },
    {
      title: "Delivery",
      icon: (
        <Image
          source={require("../assets/Icons/Delivery.png")}
          style={styles.icon}
        />
      ),
    },
    {
      title: "Payment Recovery",
      icon: (
        <Image
          source={require("../assets/Icons/payment.png")}
          style={styles.icon}
        />
      ),
    },
    {
      title: "Live Tracking",
      icon: (
        <Image
          source={require("../assets/Icons/LiveTraking.png")}
          style={styles.icon}
        />
      ),
    },
    
  ];
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
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

            <TouchableOpacity
              style={styles.viewContainer}
              onPress={() => setShowBalance(!showBalance)}
            >
              {showBalance ? (
                <EyeOff size={18} color="#ffffffff" />
              ) : (
                <Eye size={22} color="#1e00ffff" />
              )}
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

        <View style={styles.tabsContainer}>
          {menu.map((item, index) => (
            <TouchableOpacity key={index} style={styles.card}
            onPress={() => {
    if (item.title === "Order Booking") {
      navigation.navigate("Customer");
    }
  }}
            >
              <View style={styles.leftSection}>
                <View style={styles.iconBox}>{item.icon}</View>

                <View style={styles.rowContainer}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={styles.arrowBox2}>
                    <ArrowUpRight size={12} color="blue" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <OtherReports />

        <RecentActivitySection />

       
      </View>
    </ScrollView>
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
    borderRadius: 2,
  },

  avgSale: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "500",
  },

  tabsContainer: {
    marginTop: -180,
    width: 320,
    height: 198,
    backgroundColor: "#ffffffff",
    borderRadius: 12,
    alignSelf: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  card: {
    width: "48%",
    height: 80,
    backgroundColor: "#f5f7fa",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  leftSection: {
    flexDirection: "column",
  },
  iconBox: {
    backgroundColor: "#e1ecff",
    padding: 6,
    borderRadius: 10,
    marginBottom: 6,
    width: 42,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 11,
    color: "#2a2a2a",
    fontWeight: "700",
    width: 100,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  arrowBox2: {
    backgroundColor: "#e1ecff",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -3,
  },

  icon: { width: 26, height: 26, resizeMode: "contain" },

  button: {
    backgroundColor: "#676de3ff",
    width: "100%",
    paddingVertical: 18,
    borderRadius: 10,
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonText: { color: "#ffffffff", fontSize: 16, fontWeight: "400" },
});
