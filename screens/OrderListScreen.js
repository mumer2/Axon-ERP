import React, { useState, useEffect } from "react";
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
  addOrderBooking,
  addOrderBookingLine,
  getOrderLineByBookingAndItem,
  updateOrderBookingLine,
  addRecentActivity,
} from "../database";
import { X, Plus, Minus } from "lucide-react-native";

export default function OrderListScreen({ navigation, route }) {
  const { customerId, orderList: initialList = [], bookingId = null, customerName } =
    route.params || {};
  // Filter out undefined items just in case
  const validInitialList = Array.isArray(initialList)
    ? initialList.filter((item) => item != null)
    : [];

  const [orderList, setOrderList] = useState(validInitialList);

  // Remove item
  const handleRemoveItem = (itemId) => {
    setOrderList((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Increase quantity
  const increaseQty = (itemId) => {
    setOrderList((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQty = (itemId) => {
    setOrderList((prev) =>
      prev
        .map((item) =>
          item.id === itemId && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1, total: (item.quantity - 1) * item.price }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Submit or update order
  const handleSubmitOrder = async () => {
    if (!orderList.length) {
      Alert.alert("Error", "No items in the order list.");
      return;
    }

    try {
      if (bookingId) {
        // Update existing order
        for (const item of orderList) {
          const existingLines = await getOrderLineByBookingAndItem(bookingId, item.id);
          if (existingLines.length > 0) {
            const existingLine = existingLines[0];
            const newQty = existingLine.order_qty + item.quantity;
            await updateOrderBookingLine(existingLine.line_id, {
              order_qty: newQty,
              amount: newQty * item.price,
            });
          } else {
            await addOrderBookingLine({
              booking_id: bookingId,
              item_id: item.id,
              order_qty: item.quantity,
              unit_price: item.price,
              amount: item.total,
            });
          }
        }
        Alert.alert("Success", "Items added to existing order!");
        navigation.navigate("Order Details", { bookingId, customerId });
      } else {
        // Create new order
        const orderDate = new Date().toISOString();
        const orderNo = `ORD-${Date.now()}`;
        const createdBy = 1;
        const createdDate = new Date().toISOString();

        const newBookingId = await addOrderBooking({
          order_date: orderDate,
          customer_id: customerId,
          order_no: orderNo,
          created_by_id: createdBy,
          created_date: createdDate,
        });

        let totalAmount = 0;
        let totalItems = 0;

        for (const item of orderList) {
          await addOrderBookingLine({
            booking_id: newBookingId,
            item_id: item.id,
            order_qty: item.quantity,
            unit_price: item.price,
            amount: item.total,
          });
          totalAmount += item.total;
          totalItems += item.quantity;
        }

        // Add recent activity
        await addRecentActivity({
          booking_id: newBookingId,
          customer_name: customerName || "Customer",
          item_count: totalItems,
          total_amount: totalAmount,
        });

        Alert.alert("Success", "Order submitted successfully!");
        navigation.navigate("All Orders", { customerId });
      }
    } catch (error) {
      console.error("Order submission error:", error);
      Alert.alert("Error", "Failed to submit order");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>Rs.{item.price}</Text>
      </View>

      <View style={styles.qtyContainer}>
        <TouchableOpacity onPress={() => decreaseQty(item.id)} style={styles.qtyBtn}>
          <Minus size={16} color="#000" />
        </TouchableOpacity>

        <Text style={styles.qtyText}>{item.quantity}</Text>

        <TouchableOpacity onPress={() => increaseQty(item.id)} style={styles.qtyBtn}>
          <Plus size={16} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.itemRight}>
        <Text style={styles.itemTotal}>Rs.{item.total.toFixed(2)}</Text>
        <TouchableOpacity style={styles.removeIcon} onPress={() => handleRemoveItem(item.id)}>
          <X size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const totalAmount = orderList.reduce((sum, item) => sum + item.total, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.container}>
          <Text style={styles.title}>Your Order List:</Text>

          {orderList.length > 0 ? (
            <FlatList
              data={orderList}
              keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 150 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.emptyText}>No items in your order.</Text>
          )}

          {orderList.length > 0 && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>Rs.{totalAmount.toFixed(2)}</Text>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitOrder}>
                <Text style={styles.submitText}>{bookingId ? "Add to Order" : "Submit Order"}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#111" },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },

  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: "bold", color: "#111" },
  itemPrice: { fontSize: 13, color: "#555", marginTop: 2 },

  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 8,
  },
  qtyBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  qtyText: { fontSize: 14, fontWeight: "600", marginHorizontal: 6, color: "#000", width: 24, textAlign: "center" },

  itemRight: { flexDirection: "row", alignItems: "center" },
  itemTotal: { fontSize: 14, fontWeight: "bold", color: "#2954E5" },
  removeIcon: { marginLeft: 10 },

  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, borderTopWidth: 1, borderColor: "#ddd", paddingTop: 6 },
  totalLabel: { fontWeight: "bold", fontSize: 16, color: "#111" },
  totalValue: { fontWeight: "bold", fontSize: 16, color: "#2954E5" },

  submitBtn: { backgroundColor: "#10B981", padding: 16, borderRadius: 12, marginTop: 10, alignItems: "center" },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  emptyText: { textAlign: "center", color: "#999", fontSize: 15, marginTop: 60 },
});




// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   Platform,
//   KeyboardAvoidingView,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   addOrderBooking,
//   addOrderBookingLine,
//   getOrderLineByBookingAndItem,
//   updateOrderBookingLine,
// } from "../database";
// import { X, Plus, Minus } from "lucide-react-native";

// export default function OrderListScreen({ navigation, route }) {
//   const { customerId, orderList: initialList, bookingId = null } = route.params;
//   const [orderList, setOrderList] = useState(initialList);

//   // 🗑️ Remove an item
//   const handleRemoveItem = (itemId) => {
//     const updatedList = orderList.filter((item) => item.id !== itemId);
//     setOrderList(updatedList);
//   };

//   // ➕ Increase quantity
//   const increaseQty = (itemId) => {
//     setOrderList((prev) =>
//       prev.map((item) =>
//         item.id === itemId
//           ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
//           : item
//       )
//     );
//   };

//   // ➖ Decrease quantity
//   const decreaseQty = (itemId) => {
//     setOrderList((prev) =>
//       prev
//         .map((item) =>
//           item.id === itemId && item.quantity > 1
//             ? { ...item, quantity: item.quantity - 1, total: (item.quantity - 1) * item.price }
//             : item
//         )
//         .filter((item) => item.quantity > 0)
//     );
//   };

//   // ✅ Submit or update order
//   const handleSubmitOrder = async () => {
//     if (orderList.length === 0) {
//       Alert.alert("Error", "No items in the order list.");
//       return;
//     }

//     try {
//       if (bookingId) {
//         // 👈 Update existing order
//         for (const item of orderList) {
//           const existingLines = await getOrderLineByBookingAndItem(bookingId, item.id);
//           if (existingLines.length > 0) {
//             const existingLine = existingLines[0];
//             const newQty = existingLine.order_qty + item.quantity;
//             await updateOrderBookingLine(existingLine.line_id, {
//               order_qty: newQty,
//               amount: newQty * item.price,
//             });
//           } else {
//             await addOrderBookingLine({
//               booking_id: bookingId,
//               item_id: item.id,
//               order_qty: item.quantity,
//               unit_price: item.price,
//               amount: item.total,
//             });
//           }
//         }
//         Alert.alert("Success", "Items added to existing order!");
//         navigation.navigate("Order Details", { bookingId, customerId });
//       } else {
//         // 👈 Create new order
//         const orderDate = new Date().toISOString();
//         const orderNo = `ORD-${Date.now()}`;
//         const createdBy = 1;
//         const createdDate = new Date().toISOString();

//         const newBookingId = await addOrderBooking({
//           order_date: orderDate,
//           customer_id: customerId,
//           order_no: orderNo,
//           created_by_id: createdBy,
//           created_date: createdDate,
//         });

//         for (const item of orderList) {
//           await addOrderBookingLine({
//             booking_id: newBookingId,
//             item_id: item.id,
//             order_qty: item.quantity,
//             unit_price: item.price,
//             amount: item.total,
//           });
//         }

//         Alert.alert("Success", "Order submitted successfully!");
//         navigation.navigate("All Orders", { customerId });
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert("Error", "Failed to submit order");
//     }
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.itemRow}>
//       <View style={styles.itemInfo}>
//         <Text style={styles.itemName}>{item.name}</Text>
//         <Text style={styles.itemPrice}>Rs.{item.price}</Text>
//       </View>

//       {/* Quantity controls */}
//       <View style={styles.qtyContainer}>
//         <TouchableOpacity onPress={() => decreaseQty(item.id)} style={styles.qtyBtn}>
//           <Minus size={16} color="#000" />
//         </TouchableOpacity>

//         <Text style={styles.qtyText}>{item.quantity}</Text>

//         <TouchableOpacity onPress={() => increaseQty(item.id)} style={styles.qtyBtn}>
//           <Plus size={16} color="#000" />
//         </TouchableOpacity>
//       </View>

//       {/* Total + delete */}
//       <View style={styles.itemRight}>
//         <Text style={styles.itemTotal}>Rs.{item.total.toFixed(2)}</Text>
//         <TouchableOpacity style={styles.removeIcon} onPress={() => handleRemoveItem(item.id)}>
//           <X size={22} color="#EF4444" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//       >
//         <View style={styles.container}>
//           <Text style={styles.title}>Your Order List:</Text>

//           {orderList.length > 0 ? (
//             <FlatList
//               data={orderList}
//               keyExtractor={(item, index) => index.toString()}
//               renderItem={renderItem}
//               contentContainerStyle={{ paddingBottom: 150 }}
//               showsVerticalScrollIndicator={false}
//             />
//           ) : (
//             <Text style={styles.emptyText}>No items in your order.</Text>
//           )}

//           {orderList.length > 0 && (
//             <>
//               <View style={styles.totalRow}>
//                 <Text style={styles.totalLabel}>Total:</Text>
//                 <Text style={styles.totalValue}>
//                   Rs.{orderList.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
//                 </Text>
//               </View>

//               <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitOrder}>
//                 <Text style={styles.submitText}>{bookingId ? "Add to Order" : "Submit Order"}</Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// // ---------------- STYLES ----------------
// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#f9fafb", paddingBottom: Platform.OS === "android" ? 20 : 0 },
//   container: { flex: 1, padding: 16 },
//   title: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#111" },

//   itemRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 1 },
//   },

//   itemInfo: { flex: 1 },
//   itemName: { fontSize: 15, fontWeight: "bold", color: "#111" },
//   itemPrice: { fontSize: 13, color: "#555", marginTop: 2 },

//   qtyContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f0f0f0",
//     borderRadius: 8,
//     paddingHorizontal: 6,
//     paddingVertical: 4,
//     marginRight: 8,
//   },
//   qtyBtn: { paddingHorizontal: 6, paddingVertical: 4 },
//   qtyText: { fontSize: 14, fontWeight: "600", marginHorizontal: 6, color: "#000", width: 24, textAlign: "center" },

//   itemRight: { flexDirection: "row", alignItems: "center" },
//   itemTotal: { fontSize: 14, fontWeight: "bold", color: "#2954E5" },
//   removeIcon: { marginLeft: 10 },

//   totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, borderTopWidth: 1, borderColor: "#ddd", paddingTop: 10 },
//   totalLabel: { fontWeight: "bold", fontSize: 16, color: "#111" },
//   totalValue: { fontWeight: "bold", fontSize: 16, color: "#2954E5" },

//   submitBtn: { backgroundColor: "#10B981", padding: 16, borderRadius: 12, marginTop: 20, alignItems: "center" },
//   submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

//   emptyText: { textAlign: "center", color: "#999", fontSize: 15, marginTop: 60 },
// });
