import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { addItem, initDB } from "../../database/db";

export default function AddItemScreen({ navigation }) {
  const [form, setForm] = useState({
    orderNo: "",
    customerId: "",
    customerName: "",
    itemId: "",
    itemName: "",
    quantity: "",
    date: "",
    retailPrice: "",
    itemCode: "",
    discountAmount: "",
  });

  useEffect(() => {
    initDB();
  }, []);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      await addItem(form);
      alert("✅ Item added successfully!");
      navigation.navigate("Products");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to add item.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add New Item</Text>

      {Object.keys(form).map((key) => (
        <TextInput
          key={key}
          style={styles.input}
          placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
          value={form[key]}
          onChangeText={(text) => handleChange(key, text)}
        />
      ))}

      <TouchableOpacity onPress={handleSubmit} activeOpacity={0.9}>
        <LinearGradient
          colors={["#3B82F6", "#1E3A8A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.submitButton}
        >
          <Text style={styles.submitText}>Submit</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
