// screens/CheckoutScreen.js
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useCartStore } from "../../store/useCartStore";

export default function CheckoutScreen({ navigation }) {
  const { cart, removeFromCart, clearCart, totalPrice } = useCartStore();

  const total = totalPrice();

  const handlePlaceOrder = () => {
    alert("✅ Order placed successfully!");
    clearCart();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Checkout</Text>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>Your cart is empty 😕</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={item.image} style={styles.image} />
                <View style={styles.details}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.price}>
                    Rs {item.discountPrice * item.quantity}
                  </Text>
                  <Text style={styles.qty}>Qty: {item.quantity}</Text>
                </View>
                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Text style={styles.remove}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />

          <View style={styles.footer}>
            <Text style={styles.total}>Total: Rs {total.toFixed(2)}</Text>

            <TouchableOpacity onPress={handlePlaceOrder} activeOpacity={0.9}>
              <LinearGradient
                colors={["#2563eb", "#2A7B9B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.checkoutButton}
              >
                <Text style={styles.checkoutText}>Place Order</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    fontSize: 18,
    color: "#64748b",
    marginBottom: 15,
  },
  backText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  price: {
    color: "#16a34a",
    fontWeight: "700",
    marginTop: 4,
  },
  qty: {
    color: "#64748b",
    fontSize: 14,
  },
  remove: {
    color: "#dc2626",
    fontWeight: "600",
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
  },
  total: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 15,
    textAlign: "center",
  },
  checkoutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#2563eb",
  },
  checkoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
