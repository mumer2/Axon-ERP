import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Keyboard,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import haversine from "haversine";

const { width, height } = Dimensions.get("window");

export default function LiveTrackingScreen() {
  const mapRef = useRef(null);

  // 📍 Example customers (Faisalabad)
  const customerList = [
    { id: 1, name: "Chakra Fabrics", latitude: 31.418, longitude: 73.079 },
    { id: 2, name: "Madina Cloth House", latitude: 31.425, longitude: 73.095 },
    { id: 3, name: "Kohinoor Mills", latitude: 31.405, longitude: 73.102 },
    { id: 4, name: "Saeed Textiles", latitude: 31.432, longitude: 73.089 },
    { id: 5, name: "Hassan Garments", latitude: 31.412, longitude: 73.075 },
  ];

  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [distance, setDistance] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState(customerList);

  // 🧭 Get user's location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      // Watch live movement
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (loc) => {
          setCurrentLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
    })();
  }, []);

  // 🔍 Filter customers
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredCustomers(customerList);
    } else {
      const filtered = customerList.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  };

  // 🎯 Track distance
  const handleTrack = () => {
    Keyboard.dismiss();
    if (!selectedCustomer) {
      alert("Please select a customer to track");
      return;
    }
    if (!currentLocation) return;

    const dist = haversine(currentLocation, selectedCustomer, { unit: "km" }).toFixed(2);
    setDistance(dist);

    mapRef.current.fitToCoordinates([currentLocation, selectedCustomer], {
      edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      {/* 🔍 Search and Track Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search customer..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <TouchableOpacity style={styles.trackButton} onPress={handleTrack}>
            <Text style={styles.trackText}>Track</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 📋 Search Results */}
      {searchQuery.length > 0 && (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.customerItem}
              onPress={() => {
                setSelectedCustomer(item);
                setSearchQuery("");
                Keyboard.dismiss();
                mapRef.current.animateToRegion({
                  latitude: item.latitude,
                  longitude: item.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
              }}
            >
              <Text style={styles.customerName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.customerList}
        />
      )}

      {/* 🗺️ Map */}
      {currentLocation ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation={true}
          showsMyLocationButton={true}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {customerList.map((cust) => (
            <Marker
              key={cust.id}
              coordinate={{ latitude: cust.latitude, longitude: cust.longitude }}
              title={cust.name}
              onPress={() => setSelectedCustomer(cust)}
            >
              <Image
                source={require("../assets/customer.png")}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </Marker>
          ))}

          {/* 🔵 Draw route */}
          {selectedCustomer && (
            <Polyline
              coordinates={[currentLocation, selectedCustomer]}
              strokeColor="#007bff"
              strokeWidth={4}
            />
          )}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}

      {/* 📏 Distance Info */}
      {distance && selectedCustomer && (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Tracking Customer</Text>
          <Text style={styles.infoText}>{selectedCustomer.name}</Text>
          <Text style={styles.infoDistance}>{distance} km away</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },

  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    width: "100%",
    paddingHorizontal: 15,
    zIndex: 20,
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    color: "#333",
  },
  trackButton: {
    marginLeft: 8,
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  trackText: { color: "#fff", fontWeight: "bold" },

  customerList: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 80,
    left: 15,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    maxHeight: height * 0.25,
    zIndex: 30,
  },
  customerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  customerName: { fontSize: 16, color: "#333" },

  map: {
    flex: 1,
  },

  infoBox: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  infoTitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  infoDistance: {
    fontSize: 15,
    color: "#007bff",
    marginTop: 3,
  },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, color: "#333" },
});
