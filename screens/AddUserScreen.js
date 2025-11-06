import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { addUser } from "../database/db";

export default function AddUserScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const saveUser = async () => {
    if (!name || !email || !phone) {
      Alert.alert("Error", "All fields required");
      return;
    }

    await addUser(name, email, phone);
    Alert.alert("Success ✅", "User saved");

    setName("");
    setEmail("");
    setPhone("");
    navigation.navigate("UserList");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New User</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
      />

      <Button title="Save User" onPress={saveUser} />
      <View style={{ marginTop: 10 }}>
        <Button
          title="View Users"
          onPress={() => navigation.navigate("UserList")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: "#777",
  },
});
