import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { getOrderDetails } from "../database";

export default function OrderDetailsScreen({ route }) {
  const { bookingId } = route.params;
  const [details, setDetails] = useState([]);

  useEffect(() => {
    const loadDetails = async () => {
      const data = await getOrderDetails(bookingId);
      setDetails(data);
    };
    loadDetails();
  }, [bookingId]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Order Details</Text>

      <FlatList
        data={details}
        keyExtractor={(item) => item.line_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemName}>{item.item_name}</Text>
            <Text style={styles.itemInfo}>
              Qty: {item.order_qty} × Rs {item.unit_price.toFixed(2)}
            </Text>
            <Text style={styles.amount}>Total: Rs {item.amount.toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
    padding: 15,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  itemInfo: {
    color: "#666",
    marginTop: 5,
  },
  amount: {
    marginTop: 5,
    fontWeight: "bold",
    color: "#007bff",
  },
});
