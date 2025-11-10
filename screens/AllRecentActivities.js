// screens/AllRecentActivities.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image} from "react-native";
import { getRecentActivities } from "../database"; // import your DB function
import { SafeAreaView } from "react-native-safe-area-context";


export default function AllRecentActivities() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getRecentActivities();
        const mappedData = data.map((item) => ({
          id: item.id,
          title: `Order #${item.booking_id}`,
          desc: `${item.item_count} items purchased, Total Rs.${item.total_amount.toFixed(2)}`,
          date: new Date(item.activity_date).toLocaleDateString(),
          day: new Date(item.activity_date).toLocaleDateString("en-US", { weekday: "short" }),
          bg: "#D9F7E5",
          icon: (
            <Image
              source={require("../assets/Icons/LeadStatus.png")}
              style={styles.icon}
            />
          ),
        }));
        // latest first
        setActivities(mappedData.reverse());
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      }
    };

    fetchActivities();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
        {item.icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>{item.desc}</Text>
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.day}>{item.day}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <Text style={styles.header}>All Recent Activities</Text>
      {activities.length > 0 ? (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.emptyText}>No recent activity yet.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2D99FF", padding: 15 },
  header: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 15 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderStyle: "dotted",
    borderColor: "#E3E3E3",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#000" },
  cardDesc: { fontSize: 10, color: "#666", marginTop: 2 },
  dateContainer: { alignItems: "flex-end", gap: 16 },
  date: { fontSize: 12, color: "gray", fontWeight: "600" },
  day: { fontSize: 11, color: "#888" },
  icon: { width: 26, height: 26, resizeMode: "contain" },
  emptyText: { textAlign: "center", color: "#fff", marginTop: 20, fontSize: 14 },
});
