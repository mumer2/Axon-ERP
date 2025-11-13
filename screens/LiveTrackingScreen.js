import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Keyboard,
  Dimensions,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import haversine from "haversine";
import PolylineDecoder from "@mapbox/polyline";
import { getAllCustomers, searchCustomers } from "../database";
import { SafeAreaView } from "react-native-safe-area-context";

const GOOGLE_MAPS_API_KEY = "AIzaSyCpXDv4FldOMug08hNGFwAn7fGcviuLHF4";
const { height } = Dimensions.get("window");

export default function LiveTrackingScreen({ route }) {
  const mapRef = useRef(null);
  const passedCustomer = route?.params?.customer || null;
  const passedCustomerUsed = useRef(false);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [distance, setDistance] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [tracking, setTracking] = useState(false);

  // ----------------------- Location Setup -----------------------
  useEffect(() => {
    let subscription;

    const initLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "App requires location permission to work properly."
          );
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setCurrentLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        // Watch location for live updates
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5 },
          (locUpdate) => {
            const newLoc = {
              latitude: locUpdate.coords.latitude,
              longitude: locUpdate.coords.longitude,
            };
            setCurrentLocation(newLoc);

            // Update route if tracking
            if (tracking && selectedCustomer) {
              const customerLoc = {
                latitude: parseFloat(selectedCustomer.latitude),
                longitude: parseFloat(selectedCustomer.longitude),
              };
              fetchRoute(newLoc, customerLoc);
              updateDistance(newLoc, customerLoc);
            }
          }
        );
      } catch (err) {
        console.log("Location error:", err);
      }
    };

    initLocation();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [tracking, selectedCustomer]);

  // ----------------------- Fetch Customers -----------------------
  useEffect(() => {
    const fetchCustomers = async () => {
      const data = await getAllCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    };
    fetchCustomers();
  }, []);

  // ----------------------- Handle Passed Customer -----------------------
  useEffect(() => {
    if (passedCustomer && !passedCustomerUsed.current) {
      passedCustomerUsed.current = true;
      setSelectedCustomer(passedCustomer);

      const customerLoc = {
        latitude: parseFloat(passedCustomer.latitude),
        longitude: parseFloat(passedCustomer.longitude),
      };

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: customerLoc.latitude,
            longitude: customerLoc.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      }

      if (currentLocation) {
        setTracking(true);
        updateDistance(currentLocation, customerLoc);
        fetchRoute(currentLocation, customerLoc);
      }
    }
  }, [passedCustomer, currentLocation]);

  // ----------------------- Search Customers -----------------------
  // ----------------------- Search Customers -----------------------
  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredCustomers(customers);
      setSelectedCustomer(null);
      setRouteCoords([]);
      setTracking(false);
    } else {
      const data = await searchCustomers(text);
      setFilteredCustomers(data);

      if (data.length === 1) {
        const customer = data[0];
        setSelectedCustomer(customer);

        // Automatically start tracking
        if (currentLocation && customer.latitude && customer.longitude) {
          setTracking(true);

          const customerLoc = {
            latitude: parseFloat(customer.latitude),
            longitude: parseFloat(customer.longitude),
          };

          updateDistance(currentLocation, customerLoc);
          fetchRoute(currentLocation, customerLoc);

          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude: customerLoc.latitude,
                longitude: customerLoc.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              1000
            );
          }
        }
      } else {
        setSelectedCustomer(null);
      }
    }
  };

  // ----------------------- Fetch Route -----------------------
  const fetchRoute = async (origin, destination) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes.length) {
        const points = PolylineDecoder.decode(
          data.routes[0].overview_polyline.points
        );
        const coords = points.map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));
        setRouteCoords(coords);
      }
    } catch (error) {
      console.log("Directions error:", error);
    }
  };

  // ----------------------- Update Distance -----------------------
  const updateDistance = (origin, destination) => {
    const dist = haversine(origin, destination, { unit: "km" }).toFixed(2);
    setDistance(dist);
  };

  // ----------------------- Track Customer -----------------------
  const handleTrack = async () => {
    if (!selectedCustomer) {
      Alert.alert("Select Customer", "Please select a customer to track.");
      return;
    }

    if (!currentLocation) {
      Alert.alert(
        "Location not available",
        "Waiting for GPS signal. Try again in a moment."
      );
      return;
    }

    setTracking(true);

    const customerLoc = {
      latitude: parseFloat(selectedCustomer.latitude),
      longitude: parseFloat(selectedCustomer.longitude),
    };

    updateDistance(currentLocation, customerLoc);
    fetchRoute(currentLocation, customerLoc);

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: customerLoc.latitude,
          longitude: customerLoc.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }

    Keyboard.dismiss();
  };

  // ----------------------- Clear Tracking -----------------------
  const clearTracking = () => {
    setSelectedCustomer(null);
    setRouteCoords([]);
    setDistance(null);
    setTracking(false);
    setFilteredCustomers(customers);
    setSearchQuery("");
    passedCustomerUsed.current = true;

    if (mapRef.current && currentLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000
      );
    }
  };

  // ----------------------- Auto Track when Marker Pressed -----------------------
  const handleMarkerPress = (cust) => {
    setSelectedCustomer(cust);
    setTracking(true);
    const customerLoc = {
      latitude: parseFloat(cust.latitude),
      longitude: parseFloat(cust.longitude),
    };

    if (currentLocation) {
      updateDistance(currentLocation, customerLoc);
      fetchRoute(currentLocation, customerLoc);
    }

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: customerLoc.latitude,
          longitude: customerLoc.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  // ----------------------- Render -----------------------
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* Top Search Bar + Track */}
          <View style={styles.topBar}>
            <View style={styles.searchSection}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search customer..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              <TouchableOpacity
                style={[
                  styles.trackButton,
                  { backgroundColor: selectedCustomer ? "#007bff" : "#ccc" },
                ]}
                onPress={handleTrack}
                disabled={!selectedCustomer}
              >
                <Text style={styles.trackText}>Track</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Customer List */}
          {searchQuery.length > 0 && filteredCustomers.length > 0 && (
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item, index) =>
                item?.entity_id ? item.entity_id.toString() : `dummy-${index}`
              }
              renderItem={({ item }) =>
                item ? (
                  <TouchableOpacity
                    style={styles.customerItem}
                    onPress={() => {
                      setSelectedCustomer(item);
                      setSearchQuery("");
                      setFilteredCustomers([item]);
                      Keyboard.dismiss();

                      if (currentLocation && item.latitude && item.longitude) {
                        setTracking(true);

                        const customerLoc = {
                          latitude: parseFloat(item.latitude),
                          longitude: parseFloat(item.longitude),
                        };

                        updateDistance(currentLocation, customerLoc);
                        fetchRoute(currentLocation, customerLoc);

                        if (mapRef.current) {
                          mapRef.current.animateToRegion(
                            {
                              latitude: customerLoc.latitude,
                              longitude: customerLoc.longitude,
                              latitudeDelta: 0.01,
                              longitudeDelta: 0.01,
                            },
                            1000
                          );
                        }
                      }
                    }}
                  >
                    <Text style={styles.customerName}>{item.name}</Text>
                  </TouchableOpacity>
                ) : null
              }
              style={styles.customerList}
            />
          )}

          {/* Map */}
          {currentLocation ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              showsUserLocation
              showsMyLocationButton
              initialRegion={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {(selectedCustomer ? [selectedCustomer] : filteredCustomers).map(
                (cust, index) =>
                  cust && cust.latitude && cust.longitude ? (
                    <Marker
                      key={
                        cust.entity_id
                          ? cust.entity_id.toString()
                          : `marker-${index}`
                      }
                      coordinate={{
                        latitude: parseFloat(cust.latitude),
                        longitude: parseFloat(cust.longitude),
                      }}
                      title={cust.name}
                      pinColor={
                        selectedCustomer?.entity_id === cust.entity_id
                          ? "#007bff"
                          : cust.visited === "Visited"
                          ? "green"
                          : "red"
                      }
                      onPress={() => handleMarkerPress(cust)}
                    />
                  ) : null
              )}

              {routeCoords.length > 0 && (
                <Polyline
                  coordinates={routeCoords}
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

          {/* Distance Info */}
          {distance && selectedCustomer && (
            <View style={styles.infoBox}>
              <View style={styles.infoContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Tracking Customer</Text>
                  <Text style={styles.infoText}>{selectedCustomer.name}</Text>
                  <Text style={styles.infoDistance}>{distance} km away</Text>
                </View>
                <TouchableOpacity
                  onPress={clearTracking}
                  style={styles.clearBtn}
                >
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ----------------------- Styles -----------------------
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
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
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
  map: { flex: 1 },
  infoBox: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  infoContent: { flexDirection: "row", alignItems: "center" },
  infoTitle: { fontSize: 14, color: "#888", marginBottom: 4 },
  infoText: { fontSize: 16, fontWeight: "600", color: "#333" },
  infoDistance: { fontSize: 15, color: "#007bff", marginTop: 3 },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  clearText: { fontSize: 18, color: "#555" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, color: "#333" },
});

// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   FlatList,
//   Keyboard,
//   Dimensions,
//   Platform,
//   Alert,
//   KeyboardAvoidingView,
// } from "react-native";
// import MapView, { Marker, Polyline } from "react-native-maps";
// import * as Location from "expo-location";
// import haversine from "haversine";
// import PolylineDecoder from "@mapbox/polyline";
// import { getAllCustomers, searchCustomers } from "../database";
// import { SafeAreaView } from "react-native-safe-area-context";

// const GOOGLE_MAPS_API_KEY = "AIzaSyCpXDv4FldOMug08hNGFwAn7fGcviuLHF4";
// const { height } = Dimensions.get("window");

// export default function LiveTrackingScreen({ route }) {
//   const mapRef = useRef(null);
//   const passedCustomer = route?.params?.customer || null;
//   const passedCustomerUsed = useRef(false);

//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [customers, setCustomers] = useState([]);
//   const [filteredCustomers, setFilteredCustomers] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [distance, setDistance] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [tracking, setTracking] = useState(false);

//   // ----------------------- Location Setup -----------------------
//   useEffect(() => {
//     let subscription;

//     const initLocation = async () => {
//       try {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") {
//           Alert.alert(
//             "Permission Denied",
//             "App requires location permission to work properly."
//           );
//           return;
//         }

//         const loc = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.High,
//         });

//         setCurrentLocation({
//           latitude: loc.coords.latitude,
//           longitude: loc.coords.longitude,
//         });

//         // Watch location for live updates
//         subscription = await Location.watchPositionAsync(
//           { accuracy: Location.Accuracy.High, distanceInterval: 5 },
//           (locUpdate) => {
//             const newLoc = {
//               latitude: locUpdate.coords.latitude,
//               longitude: locUpdate.coords.longitude,
//             };
//             setCurrentLocation(newLoc);

//             // Update route if tracking
//             if (tracking && selectedCustomer) {
//               const customerLoc = {
//                 latitude: parseFloat(selectedCustomer.latitude),
//                 longitude: parseFloat(selectedCustomer.longitude),
//               };
//               fetchRoute(newLoc, customerLoc);
//               updateDistance(newLoc, customerLoc);

//               // Zoom in on customer
//               if (mapRef.current) {
//                 mapRef.current.animateToRegion(
//                   {
//                     latitude: customerLoc.latitude,
//                     longitude: customerLoc.longitude,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                   },
//                   1000
//                 );
//               }
//             }
//           }
//         );
//       } catch (err) {
//         console.log("Location error:", err);
//       }
//     };

//     initLocation();

//     return () => {
//       if (subscription) subscription.remove();
//     };
//   }, [tracking, selectedCustomer]);

//   // ----------------------- Fetch Customers -----------------------
//   useEffect(() => {
//     const fetchCustomers = async () => {
//       const data = await getAllCustomers();
//       setCustomers(data);
//       setFilteredCustomers(data);
//     };
//     fetchCustomers();
//   }, []);

//   // ----------------------- Handle Passed Customer -----------------------
//  useEffect(() => {
//   if (passedCustomer && !passedCustomerUsed.current) {
//     passedCustomerUsed.current = true;

//     setSelectedCustomer(passedCustomer);

//     const customerLoc = {
//       latitude: parseFloat(passedCustomer.latitude),
//       longitude: parseFloat(passedCustomer.longitude),
//     };

//     // Zoom to customer
//     if (mapRef.current) {
//       mapRef.current.animateToRegion(
//         {
//           latitude: customerLoc.latitude,
//           longitude: customerLoc.longitude,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         },
//         1000
//       );
//     }

//     // Start tracking automatically
//     if (currentLocation) {
//       setTracking(true);
//       updateDistance(currentLocation, customerLoc);
//       fetchRoute(currentLocation, customerLoc);
//     }
//   }
// }, [passedCustomer, currentLocation]);

//   // ----------------------- Search Customers -----------------------
//   const handleSearch = async (text) => {
//     setSearchQuery(text);
//     if (text.trim() === "") {
//       setFilteredCustomers(customers);
//       setSelectedCustomer(null);
//       setRouteCoords([]);
//       setTracking(false);
//     } else {
//       const data = await searchCustomers(text);
//       setFilteredCustomers(data);
//       if (data.length === 1) {
//         setSelectedCustomer(data[0]);
//         // Zoom into searched customer
//         const c = data[0];
//         if (mapRef.current) {
//           mapRef.current.animateToRegion(
//             {
//               latitude: parseFloat(c.latitude),
//               longitude: parseFloat(c.longitude),
//               latitudeDelta: 0.01,
//               longitudeDelta: 0.01,
//             },
//             1000
//           );
//         }
//       } else {
//         setSelectedCustomer(null);
//       }
//     }
//   };

//   // ----------------------- Fetch Route -----------------------
//   const fetchRoute = async (origin, destination) => {
//     try {
//       const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.routes.length) {
//         const points = PolylineDecoder.decode(
//           data.routes[0].overview_polyline.points
//         );
//         const coords = points.map((point) => ({
//           latitude: point[0],
//           longitude: point[1],
//         }));
//         setRouteCoords(coords);
//       }
//     } catch (error) {
//       console.log("Directions error:", error);
//     }
//   };

//   // ----------------------- Update Distance -----------------------
//   const updateDistance = (origin, destination) => {
//     const dist = haversine(origin, destination, { unit: "km" }).toFixed(2);
//     setDistance(dist);
//   };

//   // ----------------------- Track Customer -----------------------
//   const handleTrack = async () => {
//     if (!selectedCustomer) {
//       Alert.alert("Select Customer", "Please select a customer to track.");
//       return;
//     }

//     if (!currentLocation) {
//       Alert.alert(
//         "Location not available",
//         "Waiting for GPS signal. Try again in a moment."
//       );
//       return;
//     }

//     setTracking(true);

//     const customerLoc = {
//       latitude: parseFloat(selectedCustomer.latitude),
//       longitude: parseFloat(selectedCustomer.longitude),
//     };

//     updateDistance(currentLocation, customerLoc);
//     fetchRoute(currentLocation, customerLoc);

//     // Zoom IN to customer location
//     if (mapRef.current) {
//       mapRef.current.animateToRegion(
//         {
//           latitude: customerLoc.latitude,
//           longitude: customerLoc.longitude,
//           latitudeDelta: 0.01, // Zoomed in
//           longitudeDelta: 0.01,
//         },
//         1000
//       );
//     }

//     Keyboard.dismiss();
//   };

//   // ----------------------- Clear Tracking -----------------------
//   const clearTracking = () => {
//     setSelectedCustomer(null);
//     setRouteCoords([]);
//     setDistance(null);
//     setTracking(false);
//     setFilteredCustomers(customers);
//     setSearchQuery("");

//       // Prevent auto-tracking of passed customer after clearing
//   passedCustomerUsed.current = true;

//     if (mapRef.current && currentLocation) {
//       mapRef.current.animateToRegion(
//         {
//           latitude: currentLocation.latitude,
//           longitude: currentLocation.longitude,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         },
//         1000
//       );
//     }
//   };

//   // ----------------------- Render -----------------------
//   return (
//     <SafeAreaView style={{ flex: 1 }} edges={["bottom","left","right"]}>
//           <KeyboardAvoidingView
//             style={{ flex: 1 }}
//             behavior={Platform.OS === "ios" ? "padding" : undefined}
//             keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
//           >
//     <View style={styles.container}>
//       {/* Top Search Bar + Track */}
//       <View style={styles.topBar}>
//         <View style={styles.searchSection}>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search customer..."
//             placeholderTextColor="#999"
//             value={searchQuery}
//             onChangeText={handleSearch}
//           />
//           <TouchableOpacity
//             style={[
//               styles.trackButton,
//               { backgroundColor: selectedCustomer ? "#007bff" : "#ccc" },
//             ]}
//             onPress={handleTrack}
//             disabled={!selectedCustomer}
//           >
//             <Text style={styles.trackText}>Track</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Filtered Customer List */}
//       {searchQuery.length > 0 && filteredCustomers.length > 0 && (
//         <FlatList
//           data={filteredCustomers}
//           keyExtractor={(item, index) =>
//             item?.entity_id ? item.entity_id.toString() : `dummy-${index}`
//           }
//           renderItem={({ item }) =>
//             item ? (
//               <TouchableOpacity
//                 style={styles.customerItem}
//                 onPress={() => {
//                   setSelectedCustomer(item);
//                   setSearchQuery("");
//                   setFilteredCustomers([item]); // only show selected customer
//                   Keyboard.dismiss();
//                   if (mapRef.current) {
//                     mapRef.current.animateToRegion(
//                       {
//                         latitude: parseFloat(item.latitude),
//                         longitude: parseFloat(item.longitude),
//                         latitudeDelta: 0.01,
//                         longitudeDelta: 0.01,
//                       },
//                       1000
//                     );
//                   }
//                 }}
//               >
//                 <Text style={styles.customerName}>{item.name}</Text>
//               </TouchableOpacity>
//             ) : null
//           }
//           style={styles.customerList}
//         />
//       )}

//       {/* Map */}
//       {currentLocation ? (
//         <MapView
//           ref={mapRef}
//           style={styles.map}
//           showsUserLocation
//           showsMyLocationButton
//           initialRegion={{
//             latitude: currentLocation.latitude,
//             longitude: currentLocation.longitude,
//             latitudeDelta: 0.05,
//             longitudeDelta: 0.05,
//           }}
//         >
//           {(selectedCustomer ? [selectedCustomer] : filteredCustomers).map(
//             (cust, index) =>
//               cust && cust.latitude && cust.longitude ? (
//                 <Marker
//                   key={cust.entity_id ? cust.entity_id.toString() : `marker-${index}`}
//                   coordinate={{
//                     latitude: parseFloat(cust.latitude),
//                     longitude: parseFloat(cust.longitude),
//                   }}
//                   title={cust.name}
//                   pinColor={cust.visited ? "green" : "red"}
//                   onPress={() => setSelectedCustomer(cust)}
//                 />
//               ) : null
//           )}

//           {routeCoords.length > 0 && (
//             <Polyline
//               coordinates={routeCoords}
//               strokeColor="#007bff"
//               strokeWidth={4}
//             />
//           )}
//         </MapView>
//       ) : (
//         <View style={styles.loadingContainer}>
//           <Text style={styles.loadingText}>Getting your location...</Text>
//         </View>
//       )}

//       {/* Distance Info + Clear Button */}
//       {distance && selectedCustomer && (
//         <View style={styles.infoBox}>
//           <View style={styles.infoContent}>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.infoTitle}>Tracking Customer</Text>
//               <Text style={styles.infoText}>{selectedCustomer.name}</Text>
//               <Text style={styles.infoDistance}>{distance} km away</Text>
//             </View>
//             <TouchableOpacity onPress={clearTracking} style={styles.clearBtn}>
//               <Text style={styles.clearText}>✕</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </View>
//       </KeyboardAvoidingView>
//         </SafeAreaView>
//   );
// }

// // ----------------------- Styles -----------------------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f9f9f9" },
//   topBar: {
//     position: "absolute",
//     top: Platform.OS === "ios" ? 50 : 30,
//     width: "100%",
//     paddingHorizontal: 15,
//     zIndex: 20,
//   },
//   searchSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   searchInput: {
//     flex: 1,
//     backgroundColor: "#f3f3f3",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     height: 40,
//     color: "#333",
//   },
//   trackButton: {
//     marginLeft: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 9,
//     borderRadius: 8,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   trackText: { color: "#fff", fontWeight: "bold" },
//   customerList: {
//     position: "absolute",
//     top: Platform.OS === "ios" ? 100 : 80,
//     left: 15,
//     right: 15,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     maxHeight: height * 0.25,
//     zIndex: 30,
//   },
//   customerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
//   customerName: { fontSize: 16, color: "#333" },
//   map: { flex: 1 },
//   infoBox: {
//     position: "absolute",
//     bottom: 30,
//     left: 20,
//     right: 20,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.15,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 6,
//     elevation: 6,
//   },
//   infoContent: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   infoTitle: { fontSize: 14, color: "#888", marginBottom: 4 },
//   infoText: { fontSize: 16, fontWeight: "600", color: "#333" },
//   infoDistance: { fontSize: 15, color: "#007bff", marginTop: 3 },
//   clearBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#eee",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   clearText: { fontSize: 18, color: "#555" },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   loadingText: { fontSize: 16, color: "#333" },
// });

// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   FlatList,
//   Keyboard,
//   Dimensions,
//   Platform,
//   Alert,
//   Image
// } from "react-native";
// import MapView, { Marker, Polyline } from "react-native-maps";
// import * as Location from "expo-location";
// import haversine from "haversine";
// import PolylineDecoder from "@mapbox/polyline";
// import { getAllCustomers, searchCustomers } from "../database";

// const GOOGLE_MAPS_API_KEY = "AIzaSyCpXDv4FldOMug08hNGFwAn7fGcviuLHF4"; // <-- Replace

// const { height } = Dimensions.get("window");

// export default function LiveTrackingScreen() {
//   const mapRef = useRef(null);

//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [customers, setCustomers] = useState([]);
//   const [filteredCustomers, setFilteredCustomers] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [distance, setDistance] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [tracking, setTracking] = useState(false);

//   // ----------------------- Location Setup -----------------------
//   useEffect(() => {
//     let subscription;

//     const initLocation = async () => {
//       try {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") {
//           Alert.alert(
//             "Permission Denied",
//             "App requires location permission to work properly."
//           );
//           return;
//         }

//         const loc = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.High,
//         });

//         setCurrentLocation({
//           latitude: loc.coords.latitude,
//           longitude: loc.coords.longitude,
//         });

//         // Watch location for live updates
//         subscription = await Location.watchPositionAsync(
//           { accuracy: Location.Accuracy.High, distanceInterval: 5 },
//           (locUpdate) => {
//             const newLoc = {
//               latitude: locUpdate.coords.latitude,
//               longitude: locUpdate.coords.longitude,
//             };
//             setCurrentLocation(newLoc);

//             // Update route if tracking
//             if (tracking && selectedCustomer) {
//               const customerLoc = {
//                 latitude: parseFloat(selectedCustomer.latitude),
//                 longitude: parseFloat(selectedCustomer.longitude),
//               };
//               fetchRoute(newLoc, customerLoc);
//               updateDistance(newLoc, customerLoc);

//               // Zoom in on customer
//               if (mapRef.current) {
//                 mapRef.current.animateToRegion(
//                   {
//                     latitude: customerLoc.latitude,
//                     longitude: customerLoc.longitude,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                   },
//                   1000
//                 );
//               }
//             }
//           }
//         );
//       } catch (err) {
//         console.log("Location error:", err);
//       }
//     };

//     initLocation();

//     return () => {
//       if (subscription) subscription.remove();
//     };
//   }, [tracking, selectedCustomer]);

//   // ----------------------- Fetch Customers -----------------------
//   useEffect(() => {
//     const fetchCustomers = async () => {
//       const data = await getAllCustomers();
//       setCustomers(data);
//       setFilteredCustomers(data);
//     };
//     fetchCustomers();
//   }, []);

//   // ----------------------- Search Customers -----------------------
//   const handleSearch = async (text) => {
//     setSearchQuery(text);
//     if (text.trim() === "") {
//       setFilteredCustomers(customers);
//       setSelectedCustomer(null);
//     } else {
//       const data = await searchCustomers(text);
//       setFilteredCustomers(data);
//       if (data.length === 1) setSelectedCustomer(data[0]);
//       else setSelectedCustomer(null);
//     }
//   };

//   // ----------------------- Fetch Route -----------------------
//   const fetchRoute = async (origin, destination) => {
//     try {
//       const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.routes.length) {
//         const points = PolylineDecoder.decode(data.routes[0].overview_polyline.points);
//         const coords = points.map((point) => ({
//           latitude: point[0],
//           longitude: point[1],
//         }));
//         setRouteCoords(coords);
//       }
//     } catch (error) {
//       console.log("Directions error:", error);
//     }
//   };

//   // ----------------------- Update Distance -----------------------
//   const updateDistance = (origin, destination) => {
//     const dist = haversine(origin, destination, { unit: "km" }).toFixed(2);
//     setDistance(dist);
//   };

//   // ----------------------- Track Customer -----------------------
//   const handleTrack = async () => {
//     if (!selectedCustomer) {
//       Alert.alert("Select Customer", "Please select a customer to track.");
//       return;
//     }

//     if (!currentLocation) {
//       Alert.alert(
//         "Location not available",
//         "Waiting for GPS signal. Try again in a moment."
//       );
//       return;
//     }

//     setTracking(true);

//     const customerLoc = {
//       latitude: parseFloat(selectedCustomer.latitude),
//       longitude: parseFloat(selectedCustomer.longitude),
//     };

//     updateDistance(currentLocation, customerLoc);
//     fetchRoute(currentLocation, customerLoc);

//     // Zoom IN to customer location
//     if (mapRef.current) {
//       mapRef.current.animateToRegion(
//         {
//           latitude: customerLoc.latitude,
//           longitude: customerLoc.longitude,
//           latitudeDelta: 0.01, // Zoomed in
//           longitudeDelta: 0.01,
//         },
//         1000
//       );
//     }

//     Keyboard.dismiss();
//   };

//   // ----------------------- Render -----------------------
//   return (
//     <View style={styles.container}>
//       {/* Top Search Bar + Track */}
//       <View style={styles.topBar}>
//         <View style={styles.searchSection}>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search customer..."
//             placeholderTextColor="#999"
//             value={searchQuery}
//             onChangeText={handleSearch}
//           />
//           <TouchableOpacity
//             style={[
//               styles.trackButton,
//               { backgroundColor: selectedCustomer ? "#007bff" : "#ccc" },
//             ]}
//             onPress={handleTrack}
//             disabled={!selectedCustomer}
//           >
//             <Text style={styles.trackText}>Track</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Filtered Customer List */}
//       {searchQuery.length > 0 && filteredCustomers.length > 0 && (
//         <FlatList
//           data={filteredCustomers}
//           keyExtractor={(item) => item.entity_id.toString()}
//           renderItem={({ item }) => (
//             <TouchableOpacity
//               style={styles.customerItem}
//               onPress={() => {
//                 setSelectedCustomer(item);
//                 setSearchQuery("");
//                 setFilteredCustomers(customers);
//                 Keyboard.dismiss();
//                 if (mapRef.current) {
//                   mapRef.current.animateToRegion(
//                     {
//                       latitude: parseFloat(item.latitude),
//                       longitude: parseFloat(item.longitude),
//                       latitudeDelta: 0.01,
//                       longitudeDelta: 0.01,
//                     },
//                     1000
//                   );
//                 }
//               }}
//             >
//               <Text style={styles.customerName}>{item.name}</Text>
//             </TouchableOpacity>
//           )}
//           style={styles.customerList}
//         />
//       )}

//       {/* Map */}
//       {currentLocation ? (
//         <MapView
//           ref={mapRef}
//           style={styles.map}
//           showsUserLocation
//           showsMyLocationButton
//           initialRegion={{
//             latitude: currentLocation.latitude,
//             longitude: currentLocation.longitude,
//             latitudeDelta: 0.05,
//             longitudeDelta: 0.05,
//           }}
//         >
//           {customers.map((cust) => (
//             <Marker
//               key={cust.entity_id}
//               coordinate={{
//                 latitude: parseFloat(cust.latitude),
//                 longitude: parseFloat(cust.longitude),
//               }}
//               title={cust.name}
//               pinColor={cust.visited ? "green" : "red"}
//               onPress={() => setSelectedCustomer(cust)}
//             />
//           ))}

//           {/* {customers.map((cust) => (
//   <Marker
//     key={cust.entity_id}
//     coordinate={{
//       latitude: parseFloat(cust.latitude),
//       longitude: parseFloat(cust.longitude),
//     }}
//     title={cust.name}
//     onPress={() => setSelectedCustomer(cust)}
//   >
//     <Image
//       source={
//         cust.visited
//           ? require("../assets/customer.png") // green icon
//           : require("../assets/customer.png") // red icon
//       }
//       style={{ width: 40, height: 40 }}
//       resizeMode="contain"
//     />
//   </Marker>
// ))} */}

//           {routeCoords.length > 0 && (
//             <Polyline coordinates={routeCoords} strokeColor="#007bff" strokeWidth={4} />
//           )}
//         </MapView>
//       ) : (
//         <View style={styles.loadingContainer}>
//           <Text style={styles.loadingText}>Getting your location...</Text>
//         </View>
//       )}

//       {/* Distance Info */}
//       {distance && selectedCustomer && (
//         <View style={styles.infoBox}>
//           <Text style={styles.infoTitle}>Tracking Customer</Text>
//           <Text style={styles.infoText}>{selectedCustomer.name}</Text>
//           <Text style={styles.infoDistance}>{distance} km away</Text>
//         </View>
//       )}
//     </View>
//   );
// }

// // ----------------------- Styles -----------------------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f9f9f9" },
//   topBar: {
//     position: "absolute",
//     top: Platform.OS === "ios" ? 50 : 30,
//     width: "100%",
//     paddingHorizontal: 15,
//     zIndex: 20,
//   },
//   searchSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   searchInput: {
//     flex: 1,
//     backgroundColor: "#f3f3f3",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     height: 40,
//     color: "#333",
//   },
//   trackButton: {
//     marginLeft: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 9,
//     borderRadius: 8,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   trackText: { color: "#fff", fontWeight: "bold" },
//   customerList: {
//     position: "absolute",
//     top: Platform.OS === "ios" ? 100 : 80,
//     left: 15,
//     right: 15,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     maxHeight: height * 0.25,
//     zIndex: 30,
//   },
//   customerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
//   customerName: { fontSize: 16, color: "#333" },
//   map: { flex: 1 },
//   infoBox: {
//     position: "absolute",
//     bottom: 30,
//     left: 20,
//     right: 20,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 14,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.15,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 6,
//     elevation: 6,
//   },
//   infoTitle: { fontSize: 14, color: "#888", marginBottom: 4 },
//   infoText: { fontSize: 16, fontWeight: "600", color: "#333" },
//   infoDistance: { fontSize: 15, color: "#007bff", marginTop: 3 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   loadingText: { fontSize: 16, color: "#333" },
// });
