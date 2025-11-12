import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { getAllCustomers, searchCustomers } from "../database";
import { MapPin, Search } from "lucide-react-native"; 
import { SafeAreaView } from "react-native-safe-area-context";

export default function UpdateLocationScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      const data = await getAllCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    };
    fetchCustomers();
  }, []);

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredCustomers(customers);
    } else {
      const data = await searchCustomers(text);
      setFilteredCustomers(data);
    }
  };

  const handleSelectCustomer = (customer) => {
    navigation.navigate("Update Location Map", { customer });
    Keyboard.dismiss();
  };

  // Colors for profile circles
  const profileColors = ["#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D", "#FF6EC7", "#9B5DE5", "#00F5D4", "#F9C74F"];
  const getProfileColor = (id) => profileColors[id % profileColors.length];

  const renderCustomerItem = ({ item }) => (
    <TouchableOpacity style={styles.customerItem} onPress={() => handleSelectCustomer(item)}>
      <View style={[styles.profileCircle, { backgroundColor: getProfileColor(item.entity_id) }]}>
        <Text style={styles.profileText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerPhone}>{item.phone || "No Phone"}</Text>
      </View>

      <TouchableOpacity onPress={() => handleSelectCustomer(item)} style={styles.updateIcon}>
        <MapPin size={24} color="#007bff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9f9f9" }} edges={["bottom","left","right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.container}>
          <View style={styles.searchContainer}>
  <TextInput
    style={styles.searchInput}
    placeholder="Search customer..."
    placeholderTextColor="#999"
    value={searchQuery}
    onChangeText={handleSearch}
  />
  <View style={styles.iconWrapper}>
    <Search size={20} color="#999" />
  </View>
</View>


          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.entity_id.toString()}
            renderItem={renderCustomerItem}
            contentContainerStyle={{ paddingBottom: 0 }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, paddingTop:12 },
  searchContainer: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
  backgroundColor: "#fff",
  borderRadius: 8,
  paddingHorizontal: 12,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 3,
},
searchInput: {
  flex: 1,
  paddingVertical: 10,
  fontSize: 16,
},
iconWrapper: {
  marginLeft: 8,
  justifyContent: "center",
  alignItems: "center",
},
  customerItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  profileCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  profileText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  customerInfo: { flex: 1, marginLeft: 12 },
  customerName: { fontSize: 16, fontWeight: "600", color: "#333" },
  customerPhone: { fontSize: 14, color: "#666", marginTop: 2 },
  updateIcon: { padding: 8, borderRadius: 8, backgroundColor: "#e6f0ff", justifyContent: "center", alignItems: "center" },
});
