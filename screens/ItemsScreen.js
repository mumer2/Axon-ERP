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
} from "react-native";
import {
  initDB,
  getItems,
  addOrderBooking,
  addOrderBookingLine,
} from "../database"; // ✅ Updated imports
import { Search, X } from "lucide-react-native";

export default function ItemsScreen({ navigation, route }) {
  const customerId = route.params.customerId;
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState({});
  const [orderList, setOrderList] = useState([]);

  useEffect(() => {
    const loadDB = async () => {
      await initDB();
      fetchItems();
    };
    loadDB();
  }, []);

  const fetchItems = async (query = "") => {
    const data = await getItems(query);
    setItems(data);
  };

  const handleSearch = (text) => {
    setSearch(text);
    fetchItems(text);
  };

  const handleQuantityChange = (itemId, value) => {
    const num = value.replace(/[^0-9]/g, "");
    setQuantity({ ...quantity, [itemId]: num });
  };

  // ✅ Add item to order list
  const handleAddItem = (item) => {
    const qty = parseInt(quantity[item.id] || "0");
    if (!qty || qty <= 0) {
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }

    const existingIndex = orderList.findIndex((o) => o.id === item.id);
    let updatedList = [...orderList];

    if (existingIndex !== -1) {
      const updatedQty = updatedList[existingIndex].quantity + qty;
      const updatedTotal = updatedQty * item.price;
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        quantity: updatedQty,
        total: updatedTotal,
      };
    } else {
      updatedList.push({
        ...item,
        quantity: qty,
        total: qty * item.price,
      });
    }

    setOrderList(updatedList);
    setQuantity({ ...quantity, [item.id]: "" });
  };

  // ✅ Proceed — store data in both order_booking & order_booking_line
const handleProceed = async () => {
  if (orderList.length === 0) {
    Alert.alert("Error", "Please add at least one item");
    return;
  }

  try {
    const orderDate = new Date().toISOString();
    const orderNo = `ORD-${Date.now()}`;
    const createdBy = 1;
    const createdDate = new Date().toISOString();

    // ✅ Create main order header
    const bookingId = await addOrderBooking({
      order_date: orderDate,
      customer_id: customerId,
      order_no: orderNo,
      created_by_id: createdBy,
      created_date: createdDate,
    });

    console.log("✅ Order created with bookingId:", bookingId);

    // ✅ Insert order line items
    for (const item of orderList) {
      await addOrderBookingLine({
        booking_id: bookingId,
        item_id: item.id,
        order_qty: item.quantity,
        unit_price: item.price,
        amount: item.total,
      });
      console.log("✅ Line added:", item.name, item.quantity);
    }

    // ✅ Show success alert and clear state
    Alert.alert("Success", "Order submitted successfully!");

    // ✅ Clear order state and quantity inputs
    setOrderList([]);
    setQuantity({});
    setSearch("");
    await fetchItems(); // refresh item list

    // ✅ Navigate to All Orders screen
    navigation.navigate("All Orders", { customerId });
  } catch (error) {
    console.error("❌ Order Submit Error:", error);
    Alert.alert("Error", "Failed to submit order");
  }
};

const handleRemoveItem = (itemId) => {
  const updatedList = orderList.filter((item) => item.id !== itemId);
  setOrderList(updatedList);
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
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>Rs.{item.price}</Text>
      </View>
      <View style={styles.rightContainer}>
        <TextInput
          placeholder="Qty"
          keyboardType="number-pad"
          style={styles.qtyInput}
          value={quantity[item.id] ? quantity[item.id].toString() : ""}
          onChangeText={(val) => handleQuantityChange(item.id, val)}
        />
        <TouchableOpacity
          style={[
            styles.addBtn,
            {
              backgroundColor:
                quantity[item.id] && parseInt(quantity[item.id]) > 0
                  ? "#2954E5"
                  : "#ccc",
            },
          ]}
          disabled={!quantity[item.id] || parseInt(quantity[item.id]) <= 0}
          onPress={() => handleAddItem(item)}
        >
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrderItem = ({ item }) => (
  <View style={styles.orderItem}>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={styles.orderText}>
        {item.name} × {item.quantity}
      </Text>
    </View>

    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={styles.orderText}>Rs.{item.total.toFixed(2)}</Text>

      {/* ❌ Delete icon */}
      <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
        <X size={20} color="#EF4444" style={{ marginLeft: 10 }} />
      </TouchableOpacity>
    </View>
  </View>
);


  return (
    <View style={styles.container}>
      {/* Search Bar */}
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


      {/* Items list */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        style={{ marginTop: 10 }}
      />

      {/* Added items list */}
      {orderList.length > 0 && (
        <View style={styles.orderList}>
          <Text style={styles.orderTitle}>Order List:</Text>
          <FlatList
            data={orderList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderOrderItem}
          />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total:</Text>
            <Text style={styles.totalPrice}>
              Rs.{orderList.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {/* Proceed + View Orders buttons */}
      {orderList.length > 0 && (
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={[styles.bottomBtn, { backgroundColor: "#10B981" }]}
            onPress={handleProceed}
          >
            <Text style={styles.bottomBtnText}>
              Proceed ({orderList.length} items)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomBtn, { backgroundColor: "#2954E5" }]}
            onPress={handleViewOrders}
          >
            <Text style={styles.bottomBtnText}>View All Orders</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f0f2f5" },
 searchRow: {
  marginTop: 10,
},

searchContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#f5f5f5",
  borderRadius: 10,
  paddingHorizontal: 10,
  borderWidth: 1,
  borderColor: "#ddd",
},

searchInput: {
  flex: 1,
  height: 40,
  color: "#000",
},

searchIcon: {
  marginLeft: 8,
},

  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  itemImage: { width: 50, height: 50, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontWeight: "bold", fontSize: 16 },
  itemPrice: { color: "#555", marginTop: 4 },
  rightContainer: { flexDirection: "row", alignItems: "center" },
  qtyInput: {
    width: 60,
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    textAlign: "center",
  },
  addBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  addText: { color: "#fff", fontWeight: "bold" },
  orderList: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
  },
  orderTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
 orderItem: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 6,
  borderBottomWidth: 0.5,
  borderColor: "#eee",
},

  orderText: { fontSize: 14 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalPrice: { fontSize: 16, fontWeight: "bold", color: "#2954E5" },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  bottomBtn: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  bottomBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});