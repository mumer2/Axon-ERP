import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getAllOrders, getOrdersByCustomer } from "../database";
import { Feather } from '@expo/vector-icons'; // Make sure you have @expo/vector-icons installed

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const route = useRoute();

  const loadOrders = async () => {
    setLoading(true);
    try {
      if (route.params?.customerId) {
        const data = await getOrdersByCustomer(route.params.customerId);
        setOrders(data);
      } else {
        const data = await getAllOrders();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadOrders);
    return unsubscribe;
  }, [navigation, route.params?.customerId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {route.params?.customerName
            ? `No orders found for ${route.params.customerName}`
            : "No orders found"}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {route.params?.customerName ? (
            <Text style={styles.headerText}>
              <Text style={styles.grayText}>Customer: </Text>
              <Text style={styles.blueText}>{route.params.customerName}</Text>
            </Text>
          ) : (
            <Text style={[styles.headerText, styles.grayText]}>All Orders</Text>
          )}
        </View>

        {/* Orders List */}
        <FlatList
          data={orders}
          keyExtractor={(item) => item.booking_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("Order Details", {
                  bookingId: item.booking_id,
                  customerId: item.customer_id,
                  customerName: item.customer_name,
                  orderNo: item.order_no,
                })
              }
            >
              <View style={styles.headerRow}>
                <Text style={styles.orderNo}>{item.order_no}</Text>
                <Text style={styles.date}>
                  {new Date(item.order_date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.customer}>{item.customer_name}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoText}>Items: {item.item_count}</Text>
                <Text style={styles.infoText}>
                  Total: Rs {item.total_amount?.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 35 }}
        />
      </View>

      {/* Manual Bottom Tabs with Icons */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <Feather name="home" size={22} color="gray" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate("QRScan")}
        >
          <Feather name="camera" size={22} color="gray" />
          <Text style={styles.tabText}>QR Scan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  container: { flex: 1, backgroundColor: "#f7f8fa", padding: 10 },
  header: { marginBottom: 10 },
  headerText: { fontSize: 16, fontWeight: "500" },
  grayText: { color: "gray" },
  blueText: { color: "#007bff" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#888" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    elevation: 3,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  orderNo: { fontWeight: "bold", fontSize: 16, color: "#333" },
  date: { color: "#666", fontSize: 13 },
  customer: { marginTop: 5, fontSize: 15, color: "#007bff" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  infoText: { fontSize: 14, color: "#555" },

  bottomTabs: {
    position: "absolute",
    bottom: 26,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
  },
  tab: {
    alignItems: "center",
  },
  tabText: { fontSize: 12, color: "gray", marginTop: 2 },
});








// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Platform,
//   ActivityIndicator,
// } from "react-native";
// import { getAllOrders } from "../database";
// import { useNavigation } from "@react-navigation/native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function OrdersScreen() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigation = useNavigation();

//   const loadOrders = async () => {
//     try {
//       const data = await getAllOrders();
//       setOrders(data);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", loadOrders);
//     return unsubscribe;
//   }, [navigation]);

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text>Loading orders...</Text>
//       </View>
//     );
//   }

//   if (orders.length === 0) {
//     return (
//       <View style={styles.emptyContainer}>
//         <Text style={styles.emptyText}>No orders found</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
//       <View style={styles.container}>
//         <FlatList
//           data={orders}
//           keyExtractor={(item) => item.booking_id.toString()}
//           renderItem={({ item }) => (
//             <TouchableOpacity
//               style={styles.card}
//               onPress={() =>
//                 navigation.navigate("Order Details", {
//                   bookingId: item.booking_id,
//                   customerId: item.customer_id,
//                   customerName: item.customer_name, // pass customer name
//                   orderNo: item.order_no,           // pass order number
//                 })
//               }
//             >
//               <View style={styles.headerRow}>
//                 <Text style={styles.orderNo}>{item.order_no}</Text>
//                 <Text style={styles.date}>
//                   {new Date(item.order_date).toLocaleDateString()}
//                 </Text>
//               </View>

//               <Text style={styles.customer}>{item.customer_name}</Text>

//               <View style={styles.infoRow}>
//                 <Text style={styles.infoText}>Items: {item.item_count}</Text>
//                 <Text style={styles.infoText}>
//                   Total: Rs {item.total_amount?.toFixed(2)}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           )}
//           showsVerticalScrollIndicator={false}
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#f9fafb" },
//   container: {
//     flex: 1,
//     backgroundColor: "#f7f8fa",
//     padding: 10,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   emptyText: {
//     fontSize: 16,
//     color: "#888",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 8,
//     elevation: 3,
//   },
//   headerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   orderNo: {
//     fontWeight: "bold",
//     fontSize: 16,
//     color: "#333",
//   },
//   date: {
//     color: "#666",
//     fontSize: 13,
//   },
//   customer: {
//     marginTop: 5,
//     fontSize: 15,
//     color: "#007bff",
//   },
//   infoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   infoText: {
//     fontSize: 14,
//     color: "#555",
//   },
// });
