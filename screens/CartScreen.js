import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { Trash2, CheckCircle, Plus, Minus } from "lucide-react-native";
import { useCartStore } from "../store/useCartStore";

export default function CartScreen() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    setCartItemsCount,
  } = useCartStore();

  // ✅ Sync badge when cart changes
  React.useEffect(() => {
    setCartItemsCount(cartItems.length);
  }, [cartItems]);

  const handleQuantityChange = (id, change) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + change);
    updateQuantity(id, newQty);
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart first.");
      return;
    }

    Alert.alert("Order Placed ✅", "Your order has been placed successfully!", [
      {
        text: "OK",
        onPress: () => {
          clearCart();
          setCartItemsCount(0);
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={require("../assets/Images/Placeholder.jpg")}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.itemName}</Text>
        <Text style={styles.detailText}>Order No: {item.orderNo}</Text>
        <Text style={styles.detailText}>Customer: {item.customerName}</Text>
        <Text style={styles.detailText}>Item Code: {item.itemCode}</Text>
        <Text style={styles.detailText}>
          Retail Price: Rs {item.retailPrice}
        </Text>
        <Text style={styles.detailText}>
          Discount: Rs {item.discountAmount || 0}
        </Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => handleQuantityChange(item.id, -1)}
          >
            <Minus size={18} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => handleQuantityChange(item.id, 1)}
          >
            <Plus size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtotalText}>
          Subtotal: Rs{" "}
          {(
            (item.retailPrice - (item.discountAmount || 0)) * item.quantity
          ).toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Trash2 size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Cart Summary</Text>

      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <View style={styles.bottomContainer}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>Rs {totalPrice().toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={handlePlaceOrder}
        >
          <CheckCircle size={22} color="#fff" />
          <Text style={styles.placeOrderText}>Place Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  header: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 12 },
  cartItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  detailText: { fontSize: 13, color: "#4B5563" },
  quantityContainer: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyButton: { backgroundColor: "#2563EB", padding: 6, borderRadius: 6 },
  quantityText: { marginHorizontal: 8, fontSize: 15, fontWeight: "600", color: "#111827" },
  subtotalText: { fontSize: 14, fontWeight: "600", color: "#2563EB", marginTop: 6 },
  deleteButton: { backgroundColor: "#EF4444", padding: 8, borderRadius: 8 },
  emptyText: { textAlign: "center", fontSize: 16, color: "#6B7280", marginTop: 40 },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalLabel: { fontSize: 18, fontWeight: "600", color: "#111827" },
  totalValue: { fontSize: 18, fontWeight: "700", color: "#2563EB" },
  placeOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 10,
    borderRadius: 8,
  },
  placeOrderText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
});
