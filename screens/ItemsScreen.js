import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  initDB,
  getItems,
  getOrderLineByBookingAndItem,
  addOrderBookingLine,
  updateOrderBookingLine,
} from "../database";
import { Search, Plus, Minus } from "lucide-react-native";

export default function ItemsScreen({ navigation, route }) {
  const customerId = route.params.customerId;
  const bookingId = route.params.bookingId || null;

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState({});
  const [existingOrderItems, setExistingOrderItems] = useState([]);
  const [newItemsToAdd, setNewItemsToAdd] = useState([]);
  const [totalNewItems, setTotalNewItems] = useState(0);

  useEffect(() => {
    const loadDB = async () => {
      await initDB();
      fetchItems();
      if (bookingId) await loadExistingOrder();
    };
    loadDB();
  }, []);

  // Load existing order items
  const loadExistingOrder = async () => {
    const existingOrderList = [];
    const allItems = await getItems();
    for (const item of allItems) {
      const orderLines = await getOrderLineByBookingAndItem(bookingId, item.id);
      if (orderLines.length > 0) {
        const line = orderLines[0];
        existingOrderList.push({
          ...item,
          quantity: line.order_qty,
          total: line.order_qty * item.price,
        });
      }
    }
    setExistingOrderItems(existingOrderList);
  };

  const fetchItems = async (query = "") => {
    const data = await getItems(query);
    setItems(data);
  };

  const handleSearch = (text) => {
    setSearch(text);
    fetchItems(text);
  };

  const increaseQty = (itemId) => {
    const current = parseInt(quantity[itemId] || "0");
    setQuantity({ ...quantity, [itemId]: (current + 1).toString() });
  };

  const decreaseQty = (itemId) => {
    const current = parseInt(quantity[itemId] || "0");
    if (current > 1) {
      setQuantity({ ...quantity, [itemId]: (current - 1).toString() });
    } else {
      setQuantity({ ...quantity, [itemId]: "" });
    }
  };

  const handleQuantityChange = (itemId, val) => {
    const num = val.replace(/[^0-9]/g, "");
    setQuantity({ ...quantity, [itemId]: num });
  };

  const handleAddItem = (item) => {
    const qty = parseInt(quantity[item.id] || "0");
    if (!qty || qty <= 0) {
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }

    const existingIndex = newItemsToAdd.findIndex((o) => o.id === item.id);
    let updatedList = [...newItemsToAdd];

    if (existingIndex !== -1) {
      const updatedQty = updatedList[existingIndex].quantity + qty;
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        quantity: updatedQty,
        total: updatedQty * item.price,
      };
    } else {
      updatedList.push({
        ...item,
        quantity: qty,
        total: qty * item.price,
      });
    }

    setNewItemsToAdd(updatedList);
    setQuantity({ ...quantity, [item.id]: "" });

    // Update total new items
    const totalQty = updatedList.reduce((sum, i) => sum + i.quantity, 0);
    setTotalNewItems(totalQty);
  };

  const handleProceed = async () => {
    if (newItemsToAdd.length === 0) {
      Alert.alert("Error", "Please add at least one item before proceeding.");
      return;
    }

    try {
      if (bookingId) {
        // Add only new items to existing booking
        for (const item of newItemsToAdd) {
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
        Alert.alert("Success", "New items added to existing order!");
        navigation.navigate("Order Details", { bookingId, customerId });
      } else {
        navigation.navigate("Order List", { customerId, orderList: newItemsToAdd });
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add items");
    }
  };

  const handleViewOrders = () => {
    navigation.navigate("All Orders", { customerId });
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image
        source={
          item.image
            ? { uri: item.image }
            : require("../assets/Images/Placeholder.jpg")
        }
        style={styles.itemImage}
      />

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>Rs.{item.price}</Text>

        <View style={styles.bottomRow}>
          <View style={styles.qtyBox}>
            <TouchableOpacity onPress={() => decreaseQty(item.id)} style={styles.qtyBtn}>
              <Minus size={16} color="#000" />
            </TouchableOpacity>

            <TextInput
              placeholder="0"
              keyboardType="number-pad"
              style={styles.qtyInput}
              value={quantity[item.id] ? quantity[item.id].toString() : ""}
              onChangeText={(val) => handleQuantityChange(item.id, val)}
            />

            <TouchableOpacity onPress={() => increaseQty(item.id)} style={styles.qtyBtn}>
              <Plus size={16} color="#000" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.addBtn,
              {
                backgroundColor:
                  quantity[item.id] && parseInt(quantity[item.id]) > 0 ? "#2954E5" : "#ccc",
              },
            ]}
            disabled={!quantity[item.id] || parseInt(quantity[item.id]) <= 0}
            onPress={() => handleAddItem(item)}
          >
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          {/* Search */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search items..."
                value={search}
                onChangeText={handleSearch}
                style={styles.searchInput}
                placeholderTextColor="#888"
              />
              <TouchableOpacity onPress={() => handleSearch(search)}>
                <Search size={22} color="#2954E5" style={styles.searchIcon} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Item list */}
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 62 }}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom buttons */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={[
                styles.proceedBtn,
                { backgroundColor: totalNewItems > 0 ? "#10B981" : "#A7F3D0" },
              ]}
              onPress={handleProceed}
              disabled={totalNewItems === 0}
            >
              <Text style={styles.proceedText}>
                {bookingId
                  ? `Add to Order (${totalNewItems} items)`
                  : `Proceed (${totalNewItems} items)`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.viewAllBtn} onPress={handleViewOrders}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f2f5" },
  container: { flex: 1, padding: 16, paddingBottom: 10 },

  searchRow: { marginVertical: 10 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchInput: { flex: 1, height: 40, color: "#000" },
  searchIcon: { marginLeft: 8 },

  itemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    marginBottom: 2,
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginTop: 4 },

  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: { fontWeight: "bold", fontSize: 16 },
  itemPrice: { color: "#555", marginTop: 4 },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginRight: 8,
    paddingHorizontal: 6,
  },
  qtyBtn: { padding: 6 },
  qtyInput: { width: 40, textAlign: "center", fontSize: 14, color: "#000" },

  addBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  addText: { color: "#fff", fontWeight: "bold" },

  bottomButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 6,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  proceedBtn: { flex: 0.7, padding: 18, borderRadius: 12, alignItems: "center" },
  proceedText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  viewAllBtn: {
    flex: 0.25,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#2954E5",
  },
  viewAllText: { color: "#fff", fontWeight: "600" },
});




// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   Alert,
//   Platform,
//   KeyboardAvoidingView,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   initDB,
//   getItems,
//   getOrderLineByBookingAndItem,
//   addOrderBookingLine,
//   updateOrderBookingLine,
// } from "../database";
// import { Search, Plus, Minus } from "lucide-react-native";

// export default function ItemsScreen({ navigation, route }) {
//   const customerId = route.params.customerId;
//   const bookingId = route.params.bookingId || null; // existing order id if editing
//   const [items, setItems] = useState([]);
//   const [search, setSearch] = useState("");
//   const [quantity, setQuantity] = useState({});
//   const [orderList, setOrderList] = useState([]);

//   useEffect(() => {
//     const loadDB = async () => {
//       await initDB();
//       fetchItems();
//     };
//     loadDB();
//   }, []);

//   const fetchItems = async (query = "") => {
//     const data = await getItems(query);
//     setItems(data);
//   };

//   const handleSearch = (text) => {
//     setSearch(text);
//     fetchItems(text);
//   };

//   const increaseQty = (itemId) => {
//     const current = parseInt(quantity[itemId] || "0");
//     setQuantity({ ...quantity, [itemId]: (current + 1).toString() });
//   };

//   const decreaseQty = (itemId) => {
//     const current = parseInt(quantity[itemId] || "0");
//     if (current > 1) {
//       setQuantity({ ...quantity, [itemId]: (current - 1).toString() });
//     } else {
//       setQuantity({ ...quantity, [itemId]: "" });
//     }
//   };

//   const handleQuantityChange = (itemId, val) => {
//     const num = val.replace(/[^0-9]/g, "");
//     setQuantity({ ...quantity, [itemId]: num });
//   };

//   const handleAddItem = (item) => {
//     const qty = parseInt(quantity[item.id] || "0");
//     if (!qty || qty <= 0) {
//       Alert.alert("Error", "Please enter a valid quantity");
//       return;
//     }

//     const existingIndex = orderList.findIndex((o) => o.id === item.id);
//     let updatedList = [...orderList];

//     if (existingIndex !== -1) {
//       const updatedQty = updatedList[existingIndex].quantity + qty;
//       updatedList[existingIndex] = {
//         ...updatedList[existingIndex],
//         quantity: updatedQty,
//         total: updatedQty * item.price,
//       };
//     } else {
//       updatedList.push({
//         ...item,
//         quantity: qty,
//         total: qty * item.price,
//       });
//     }

//     setOrderList(updatedList);
//     setQuantity({ ...quantity, [item.id]: "" });
//   };

//   const handleProceed = async () => {
//     if (orderList.length === 0) {
//       Alert.alert("Error", "Please add at least one item before proceeding.");
//       return;
//     }

//     try {
//       if (bookingId) {
//         // Update existing order
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
//         // New order workflow
//         navigation.navigate("Order List", { customerId, orderList });
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert("Error", "Failed to add items");
//     }
//   };

//   const handleViewOrders = () => {
//     navigation.navigate("All Orders", { customerId });
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.itemContainer}>
//       <Image
//         source={
//           item.image
//             ? { uri: item.image }
//             : require("../assets/Images/Placeholder.jpg")
//         }
//         style={styles.itemImage}
//       />
//       <View style={styles.itemInfo}>
//         <Text style={styles.itemName}>{item.name}</Text>
//         <Text style={styles.itemPrice}>Rs.{item.price}</Text>
//       </View>

//       <View style={styles.rightContainer}>
//         <View style={styles.qtyBox}>
//           <TouchableOpacity onPress={() => decreaseQty(item.id)} style={styles.qtyBtn}>
//             <Minus size={16} color="#000" />
//           </TouchableOpacity>

//           <TextInput
//             placeholder="0"
//             keyboardType="number-pad"
//             style={styles.qtyInput}
//             value={quantity[item.id] ? quantity[item.id].toString() : ""}
//             onChangeText={(val) => handleQuantityChange(item.id, val)}
//           />

//           <TouchableOpacity onPress={() => increaseQty(item.id)} style={styles.qtyBtn}>
//             <Plus size={16} color="#000" />
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity
//           style={[
//             styles.addBtn,
//             {
//               backgroundColor:
//                 quantity[item.id] && parseInt(quantity[item.id]) > 0 ? "#2954E5" : "#ccc",
//             },
//           ]}
//           disabled={!quantity[item.id] || parseInt(quantity[item.id]) <= 0}
//           onPress={() => handleAddItem(item)}
//         >
//           <Text style={styles.addText}>Add</Text>
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
//           <View style={styles.searchRow}>
//             <View style={styles.searchContainer}>
//               <TextInput
//                 placeholder="Search items..."
//                 value={search}
//                 onChangeText={handleSearch}
//                 style={styles.searchInput}
//                 placeholderTextColor="#888"
//               />
//               <TouchableOpacity onPress={() => handleSearch(search)}>
//                 <Search size={22} color="#2954E5" style={styles.searchIcon} />
//               </TouchableOpacity>
//             </View>
//           </View>

//           <FlatList
//             data={items}
//             keyExtractor={(item) => item.id.toString()}
//             renderItem={renderItem}
//             contentContainerStyle={{ paddingBottom: 150 }}
//             showsVerticalScrollIndicator={false}
//           />

//           <View style={styles.bottomButtons}>
//             <TouchableOpacity
//               style={[
//                 styles.proceedBtn,
//                 { backgroundColor: orderList.length > 0 ? "#10B981" : "#A7F3D0" },
//               ]}
//               onPress={handleProceed}
//               disabled={orderList.length === 0}
//             >
//               <Text style={styles.proceedText}>
//                 {bookingId ? "Add to Order" : `Proceed (${orderList.length} items)`}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.viewAllBtn} onPress={handleViewOrders}>
//               <Text style={styles.viewAllText}>View All</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#f0f2f5", paddingBottom: Platform.OS === "android" ? 20 : 0 },
//   container: { flex: 1, padding: 16 },
//   searchRow: { marginTop: 10, marginBottom: 10 },
//   searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#f5f5f5", borderRadius: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: "#ddd" },
//   searchInput: { flex: 1, height: 40, color: "#000" },
//   searchIcon: { marginLeft: 8 },
//   itemContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginBottom: 10, padding: 12, borderRadius: 10, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
//   itemImage: { width: 50, height: 50, borderRadius: 8 },
//   itemInfo: { flex: 1, marginLeft: 12 },
//   itemName: { fontWeight: "bold", fontSize: 16 },
//   itemPrice: { color: "#555", marginTop: 4 },
//   rightContainer: { flexDirection: "row", alignItems: "center" },
//   qtyBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#f0f0f0", borderRadius: 8, marginRight: 8 },
//   qtyBtn: { padding: 6, borderRadius: 8 },
//   qtyInput: { width: 40, textAlign: "center", fontSize: 14, color: "#000" },
//   addBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
//   addText: { color: "#fff", fontWeight: "bold" },
//   bottomButtons: { position: "absolute", bottom: 0, left: 16, right: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   proceedBtn: { flex: 0.7, padding: 18, borderRadius: 12, alignItems: "center" },
//   proceedText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   viewAllBtn: { flex: 0.25, padding: 18, borderRadius: 12, alignItems: "center", backgroundColor: "#2954E5" },
//   viewAllText: { color: "#fff", fontWeight: "600" },
// });


