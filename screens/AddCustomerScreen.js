import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useCustomerStore } from "../store/useCustomerStore";

export default function AddCustomerScreen({ navigation }) {
  const { setCustomer } = useCustomerStore();

  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const handleSave = () => {
    if (!customerName || !customerId || !customerPhone) {
      Alert.alert("Missing Info", "Please fill all required fields.");
      return;
    }

    const newCustomer = {
      customerName,
      customerId,
      customerPhone,
      customerAddress,
    };

    // ✅ Save to Zustand store
    setCustomer(newCustomer);

    Alert.alert("Customer Added ✅", "Customer saved successfully!", [
      {
        text: "OK",
        onPress: () => navigation.navigate("AddItem"), // go to AddItem screen
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Customer</Text>

      <TextInput
        style={styles.input}
        placeholder="Customer Name"
        value={customerName}
        onChangeText={setCustomerName}
      />
      <TextInput
        style={styles.input}
        placeholder="Customer ID"
        value={customerId}
        onChangeText={setCustomerId}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={customerPhone}
        onChangeText={setCustomerPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Address (optional)"
        value={customerAddress}
        onChangeText={setCustomerAddress}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Customer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20, textAlign: "center", color: "#111827" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
