// FormScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { db } from "../db";

export default function FormScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const saveUser = async () => {
    try {
      await db.runAsync(
        "INSERT INTO users (name, email, phone) VALUES (?, ?, ?)",
        [name, email, phone]
      );

      Alert.alert("Success", "User saved successfully ✅");
      setName("");
      setEmail("");
      setPhone("");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Form</Text>

      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Phone"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
      />

      <Button title="Save User" onPress={saveUser} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
});
