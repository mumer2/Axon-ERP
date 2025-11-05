import React from "react";
import { View, Text, StyleSheet, TouchableOpacity,Image } from "react-native";
import { ArrowUpRight, ArrowDownRight } from "lucide-react-native";

export default function OtherReports() {
  const reports = [
    {
      title: "Payments Received",
      icon: <Image source={require("../assets/Icons/PaymentReceived.png")} style={styles.icon} />,
      amount: "$70.2M",
      change: "+500k",
      days: "in last 3 days",
      changeColor: "#1DBA4B",
        daysColor: "gray",
      arrow: "up",
    },
    {
      title: "Orders Booked",
      icon: <Image source={require("../assets/Icons/OrderBooked.png")} style={styles.icon} />,
      amount: "$1.2M",
      change: "+20k",
      days: "in last 1 week",
      changeColor: "#1DBA4B",
        daysColor: "gray",
      arrow: "up",
    },
    {
      title: "Outstanding Ledgers",
      icon: <Image source={require("../assets/Icons/OutstandingLedgers.png")} style={styles.icon} />,
      amount: "$200.6k",
      change: "-500k",
      days: "in last 3 days",
      changeColor: "#FF3B30",
        daysColor: "gray",
      arrow: "down",
    },
  ];

  return (
    <View style={styles.reports}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Other Reports</Text>
        <TouchableOpacity style={styles.seeMoreBtn}>
          <Text style={styles.seeMoreText}>See more</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {reports.map((item, index) => (
        <View key={index}>
          <View style={styles.row}>
            {/* Left Side Icon */}
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{item.title}</Text>

            {/* Right Side Amount + Change */}
            <View style={styles.right}>
              <Text style={styles.amount}>{item.amount}</Text>
              <View style={styles.changeRow}>
                {item.arrow === "up" ? (
                  <ArrowUpRight size={14} color={item.changeColor} />
                ) : (
                  <ArrowDownRight size={14} color={item.changeColor} />
                )}
                <Text style={[styles.changeText, { color: item.changeColor }]}>
                  {item.change}
                </Text>
                <Text style={[styles.changeText, { color: item.daysColor }]}>
                 {item.days}
                </Text>
              </View>
            </View>
          </View>

          {/* Divider except last */}
          {index < reports.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  reports: {
    backgroundColor: "#F4F6F9",
    padding: 20,
    borderRadius: 14,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  seeMoreBtn: {
    backgroundColor: "#447ac2",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  seeMoreText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#E6EFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 22,
  },

  title: {
    flex: 1,
    fontSize: 12,
    color: "gray",
    fontWeight: "500",
  },

  right: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  changeText: {
    fontSize: 13,
    marginLeft: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#DFE5EB",
    marginVertical: 4,
  },

  icon: { width: 26, height: 26, resizeMode: "contain" },

});
