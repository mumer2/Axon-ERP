import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getOrderDetails,
  deleteOrderBookingLine,
  updateOrderBookingLineDetails,
} from "../database";
import { Plus, Minus, X } from "lucide-react-native";

export default function OrderDetailsScreen({ navigation, route }) {
  const { bookingId, customerId, customerName, orderNo } = route.params;
  const [details, setDetails] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    loadDetails();
  }, [bookingId]);

  // Load order details
  const loadDetails = async () => {
    try {
      const data = await getOrderDetails(bookingId);
      setDetails(data);
      calculateTotal(data);
    } catch (error) {
      console.error("Failed to load order details:", error);
    }
  };

  // Calculate total amount
  const calculateTotal = (list) => {
    const sum = list.reduce((acc, item) => acc + item.amount, 0);
    setTotalAmount(sum);
  };

  // Delete a single order line
  const handleDeleteItem = (lineId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to remove this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteOrderBookingLine(lineId);
              const updatedList = details.filter((item) => item.line_id !== lineId);
              setDetails(updatedList);
              calculateTotal(updatedList);
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Failed to delete item");
            }
          },
        },
      ]
    );
  };

  // Increase quantity
  const increaseQty = async (item) => {
    if (!item) return;
    try {
      const currentQty = parseInt(item.order_qty) || 0;
      const newQty = currentQty + 1;
      const newAmount = newQty * parseFloat(item.unit_price);

      const updatedList = details.map((d) =>
        d.line_id === item.line_id
          ? { ...d, order_qty: newQty, amount: newAmount }
          : d
      );
      setDetails(updatedList);
      calculateTotal(updatedList);

      await updateOrderBookingLineDetails({
        booking_line_id: item.line_id,
        order_qty: newQty,
        amount: newAmount,
      });
    } catch (error) {
      console.error("Failed to increase quantity:", error);
    }
  };

  // Decrease quantity
  const decreaseQty = async (item) => {
    if (!item) return;
    try {
      const currentQty = parseInt(item.order_qty) || 0;
      if (currentQty <= 1) return;

      const newQty = currentQty - 1;
      const newAmount = newQty * parseFloat(item.unit_price);

      const updatedList = details.map((d) =>
        d.line_id === item.line_id
          ? { ...d, order_qty: newQty, amount: newAmount }
          : d
      );
      setDetails(updatedList);
      calculateTotal(updatedList);

      await updateOrderBookingLineDetails({
        booking_line_id: item.line_id,
        order_qty: newQty,
        amount: newAmount,
      });
    } catch (error) {
      console.error("Failed to decrease quantity:", error);
    }
  };

  const totalItems = details.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerInfo}>
            {/* <Text style={styles.orderText}>Order No: {orderNo}</Text> */}
            <Text style={styles.orderText}>Customer Name</Text>
            <Text style={styles.customerText}>{customerName}</Text>
          </View>

          {/* Add more items */}
          <TouchableOpacity
            style={styles.plusBtn}
            onPress={() =>
              navigation.navigate("Items", { customerId, bookingId, customerName })
            }
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Order items list */}
        <FlatList
          data={details}
          keyExtractor={(item) => item.line_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.itemRow}>
                <View>
                  <Text style={styles.itemName}>{item.item_name}</Text>
                  <Text style={styles.itemInfo}>
                    Qty: {item.order_qty} × Rs {item.unit_price.toFixed(2)}
                  </Text>
                  <Text style={styles.amount}>
                    Total: Rs {item.amount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.actions}>
                  {/* Quantity controls */}
                  <View style={styles.qtyBox}>
                    <TouchableOpacity onPress={() => decreaseQty(item)} style={styles.qtyBtn}>
                      <Minus size={16} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.order_qty}</Text>
                    <TouchableOpacity onPress={() => increaseQty(item)} style={styles.qtyBtn}>
                      <Plus size={16} color="#000" />
                    </TouchableOpacity>
                  </View>

                  {/* Delete button */}
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteItem(item.line_id)}
                  >
                    <X size={22} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 66 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Bottom bar: total items and total amount */}
        <View style={styles.bottomBar}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Items:</Text>
            <Text style={styles.totalValue}>{totalItems}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>Rs. {totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f7f8fa", paddingTop: 10 },
  
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerInfo: { flex: 1 },
  orderText: { fontSize: 14, fontWeight: 400, color: "gray", marginBottom: 4 },
  customerText: { fontSize: 18, fontWeight: "bold", color: "#2954E5" },
  plusBtn: {
    backgroundColor: "#10B981",
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    marginHorizontal: 16,
  },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemName: { fontSize: 16, fontWeight: "600", color: "#333" },
  itemInfo: { color: "#666", marginTop: 5 },
  amount: { marginTop: 5, fontWeight: "bold", color: "#007bff" },
  actions: { flexDirection: "row", alignItems: "center" },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 6,
    marginRight: 10,
  },
  qtyBtn: { padding: 4 },
  qtyText: { fontSize: 14, fontWeight: "600", marginHorizontal: 6 },
  deleteBtn: { padding: 6 },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  totalLabel: { fontWeight: "bold", fontSize: 16 },
  totalValue: { fontWeight: "bold", fontSize: 16, color: "#10B981" },
});