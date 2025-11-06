import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useCartStore } from "../store/useCartStore";
import { getAllItems } from "../database/db"; // ✅ Correct import
import { ShoppingCart } from "lucide-react-native";

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { cartItems, addToCart } = useCartStore();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const items = await getAllItems();
      setProducts(items);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Always show placeholder image (no imagePath in DB)
  const getProductImage = () => {
    return require("../assets/Images/Placeholder.jpg");
  };

  const handleAddToCart = (item) => {
    // Add the entire product info to the cart
    addToCart({
      id: item.id,
      orderNo: item.orderNo,
      customerId: item.customerId,
      customerName: item.customerName,
      itemId: item.itemId,
      itemName: item.itemName,
      quantity: item.quantity || 1,
      date: item.date,
      retailPrice: item.retailPrice,
      itemCode: item.itemCode,
      discountAmount: item.discountAmount,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerBar}>
        <Text style={styles.header}>Available Products</Text>

        <TouchableOpacity
          style={styles.cartIconContainer}
          onPress={() => navigation.navigate("Cart")}
        >
          <ShoppingCart size={26} color="#2563eb" />
          {cartItems?.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Text style={styles.noData}>No products available.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Placeholder Image */}
              <Image source={getProductImage()} style={styles.image} />

              {/* Product Info */}
              <Text style={styles.name}>{item.itemName}</Text>

              <Text style={styles.customer}>Customer: {item.customerName}</Text>
              <Text style={styles.code}>Code: {item.itemCode}</Text>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>Rs {item.retailPrice}</Text>
                {item.discountAmount > 0 && (
                  <Text style={styles.discount}>
                    Discount: Rs {item.discountAmount}
                  </Text>
                )}
              </View>

              {/* Add to Cart Button */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddToCart(item)}
              >
                <Text style={styles.addText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 10 },

  /** Loading **/
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /** Header **/
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  header: { fontSize: 22, fontWeight: "700", color: "#1E3A8A" },

  /** Cart Icon **/
  cartIconContainer: { position: "relative" },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  cartBadgeText: { color: "#fff", fontSize: 12 },

  /** Card **/
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    elevation: 3,
  },
  image: { width: 100, height: 100, borderRadius: 8, marginBottom: 6 },
  name: { fontSize: 14, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  customer: { fontSize: 12, color: "#555" },
  code: { fontSize: 12, color: "#666" },

  /** Price **/
  priceContainer: {
    marginTop: 4,
    alignItems: "center",
  },
  price: {
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "600",
  },
  discount: {
    fontSize: 12,
    color: "green",
  },

  /** Button **/
  addButton: {
    marginTop: 6,
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  /** Empty **/
  noData: {
    textAlign: "center",
    color: "#555",
    marginTop: 50,
    fontSize: 16,
  },
});
