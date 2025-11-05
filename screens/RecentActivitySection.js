import React from "react";
import { View, Text, StyleSheet, TouchableOpacity,Image } from "react-native";

export default function RecentActivitySection() {
  const data = [
    {
      icon: <Image source={require("../assets/Icons/NewClient.png")} style={styles.icon} />,
      bg: "#FFE7D3",
      title: "New Client Added",
      desc: "New client Skyline Solutions added by Ahmad Ali",
      date: "10/9/25",
      day: "Wed",
    },
    {
      icon: <Image source={require("../assets/Icons/InvoiceSent.png")} style={styles.icon} />,
      bg: "#D9F7E5",
      title: "Invoice sent",
      desc: "Invoice #240 sent to Digital Pro Agency",
      date: "10/9/25",
      day: "Wed",
    },
    {
      icon: <Image source={require("../assets/Icons/LeadStatus.png")} style={styles.icon} />,
      bg: "#FFD9DE",
      title: "Lead Status Updated",
      desc: "Lead Sana Traders moved to Negotiation Stage",
      date: "10/9/25",
      day: "Wed",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recent Activity</Text>
        <TouchableOpacity style={styles.seeMoreButton}>
          <Text style={styles.seeMoreText}>See more</Text>
        </TouchableOpacity>
      </View>

      {/* Activity Cards */}
      {data.map((item, index) => (
        <View key={index} style={styles.card}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
            {item.icon}
          </View>

          {/* Text */}
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </View>

          {/* Date */}
          <View style={styles.dateContainer}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.day}>{item.day}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#2D99FF", // blue background
    paddingBottom: 25,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },

  seeMoreButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  seeMoreText: {
    color: "gray",
    fontSize: 12,
    fontWeight: "500",
  },

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

  textContainer: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  cardDesc: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  dateContainer: {
    alignItems: "flex-end",
    gap: 16,
  },

  date: {
    fontSize: 12,
    color: "gray",
    fontWeight: "600",
  },

  day: {
    fontSize: 11,
    color: "#888",
  },

  icon: { width: 26, height: 26, resizeMode: "contain" },

});
