import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  initDB,
  getAllCustomers,
  searchCustomers,
  updateVisited,
  updateCustomerLastSeen,
} from "../database"; // ✅ added function to update last_seen
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const getAvatarColor = (name) => {
  const colors = ["#FFB6C1", "#87CEFA", "#90EE90", "#FFA07A", "#DDA0DD"];
  const charCode = name.charCodeAt(0) || 65;
  return colors[charCode % colors.length];
};

export default function CustomerScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const loadDB = async () => {
      await initDB();
      fetchCustomers();
    };
    loadDB();
  }, []);

  const fetchCustomers = async () => {
    const data = await getAllCustomers();
    applyFilter(data);
  };

  const applyFilter = (data) => {
    let filtered = [...data];
    if (filter === "visited") filtered = data.filter((i) => i.visited === "Visited");
    else if (filter === "notVisited") filtered = data.filter((i) => i.visited === "Unvisited");
    setCustomers(filtered);
  };

  const handleFilterChange = async (type) => {
    setFilter(type);
    const all = await getAllCustomers();
    let filtered = [...all];
    if (type === "visited") filtered = all.filter((i) => i.visited === "Visited");
    else if (type === "notVisited") filtered = all.filter((i) => i.visited === "Unvisited");
    setCustomers(filtered);
  };

  const handleSearch = async (text) => {
    setSearch(text);
    if (text.trim() === "") fetchCustomers();
    else {
      const data = await searchCustomers(text);
      applyFilter(data);
    }
  };

  // ✅ toggle visited and update last_seen
  const toggleVisited = async (id, visited) => {
    const newStatus = visited === "Visited" ? "Unvisited" : "Visited";
    const now = new Date().toISOString();
    await updateVisited(id, newStatus);          // update visited status
    await updateCustomerLastSeen(id, now);       // update last_seen timestamp
    fetchCustomers();
  };

  const handleCustomerPress = (customer) => {
    navigation.navigate("Items", {
      customerId: customer.entity_id,
      customerName: customer.name,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleCustomerPress(item)}
    >
      <View
        style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}
      >
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <Text style={styles.phone}>📞 {item.phone}</Text>
        <Text style={styles.lastSeen}>Last Visit: {item.last_seen}</Text>
      </View>

      <View style={styles.iconContainer}>
        <TouchableOpacity
          onPress={() => toggleVisited()}
        >
          <View
            style={[
              styles.visitedBox,
              {
                backgroundColor: item.visited === "Visited" ? "green" : "transparent",
                borderColor: item.visited === "Visited" ? "green" : "#888",
              },
            ]}
          >
            <Text
              style={[
                styles.tick,
                { color: item.visited === "Visited" ? "#fff" : "#666" },
              ]}
            >
              ✓
            </Text>
          </View>
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={() =>
            navigation.navigate("Live Tracking", {
              customer: {
                id: item.entity_id,
                name: item.name,
                latitude: item.latitude,
                longitude: item.longitude,
                visited: item.visited,
              },
            })
          }
        >
          <Feather
            name="map-pin"
            size={20}
            color="#007bff"
            style={{ marginTop: 6 }}
          />
        </TouchableOpacity> */}
         <TouchableOpacity
        onPress={() => {
          if (item.latitude != null && item.longitude != null) {
            navigation.navigate("Live Tracking", {
              customer: {
                id: item.entity_id,
                name: item.name,
                latitude: item.latitude,
                longitude: item.longitude,
                visited: item.visited,
              },
            });
          }
        }}
        disabled={item.latitude == null || item.longitude == null} // disable if no location
      >
        <Feather
          name="map-pin"
          size={20}
          color={
            item.latitude != null && item.longitude != null ? "#007bff" : "#ccc"
          }
          style={{ marginTop: 6 }}
        />
      </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.container}>
        {/* 🔍 Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchBar}
              placeholder="Search Customer..."
              value={search}
              onChangeText={handleSearch}
            />
            <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
          </View>
        </View>

        {/* 🔘 Compact Filter Buttons */}
        <View style={styles.filterContainer}>
          {["all", "visited", "notVisited"].map((type, index) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                filter === type && styles.activeFilter,
                index === 0 && styles.leftButton,
                index === 2 && styles.rightButton,
              ]}
              onPress={() => handleFilterChange(type)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === type && styles.activeFilterText,
                ]}
              >
                {type === "all"
                  ? "All"
                  : type === "visited"
                  ? "Visited"
                  : "Not Visited"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 👥 Customer List */}
        <FlatList
          data={customers}
          keyExtractor={(item) => item.entity_id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  searchBar: {
    flex: 1,
    height: 40,
  },
  searchIcon: {
    marginLeft: 10,
  },

  // ✅ Compact Filter Layout
  filterContainer: {
    flexDirection: "row",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 2,
    overflow: "hidden",
  },
  filterButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  leftButton: {
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  rightButton: {
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    borderRightWidth: 0,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  activeFilter: {
    backgroundColor: "#007bff",
  },
  activeFilterText: {
    color: "#fff",
  },

  itemContainer: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#fff",
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  infoContainer: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  phone: {
    color: "#555",
    marginTop: 2,
  },
  lastSeen: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  iconContainer: {
    alignItems: "center",
    gap: 10,
  },
  visitedBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  tick: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});










// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
// } from "react-native";
// import {
//   initDB,
//   getAllCustomers,
//   searchCustomers,
//   updateVisited,
//   updateCustomerLastSeen,
// } from "../database"; // ✅ added function to update last_seen
// import { Feather } from "@expo/vector-icons";
// import { SafeAreaView } from "react-native-safe-area-context";

// const getAvatarColor = (name) => {
//   const colors = ["#FFB6C1", "#87CEFA", "#90EE90", "#FFA07A", "#DDA0DD"];
//   const charCode = name.charCodeAt(0) || 65;
//   return colors[charCode % colors.length];
// };

// export default function CustomerScreen({ navigation }) {
//   const [customers, setCustomers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("all");

//   useEffect(() => {
//     const loadDB = async () => {
//       await initDB();
//       fetchCustomers();
//     };
//     loadDB();
//   }, []);

//   const fetchCustomers = async () => {
//     const data = await getAllCustomers();
//     applyFilter(data);
//   };

//   const applyFilter = (data) => {
//     let filtered = [...data];
//     if (filter === "visited") filtered = data.filter((i) => i.visited === "Visited");
//     else if (filter === "notVisited") filtered = data.filter((i) => i.visited === "Unvisited");
//     setCustomers(filtered);
//   };

//   const handleFilterChange = async (type) => {
//     setFilter(type);
//     const all = await getAllCustomers();
//     let filtered = [...all];
//     if (type === "visited") filtered = all.filter((i) => i.visited === "Visited");
//     else if (type === "notVisited") filtered = all.filter((i) => i.visited === "Unvisited");
//     setCustomers(filtered);
//   };

//   const handleSearch = async (text) => {
//     setSearch(text);
//     if (text.trim() === "") fetchCustomers();
//     else {
//       const data = await searchCustomers(text);
//       applyFilter(data);
//     }
//   };

//   // ✅ toggle visited and update last_seen
//   const toggleVisited = async (id, visited) => {
//     const newStatus = visited === "Visited" ? "Unvisited" : "Visited";
//     const now = new Date().toISOString();
//     await updateVisited(id, newStatus);          // update visited status
//     await updateCustomerLastSeen(id, now);       // update last_seen timestamp
//     fetchCustomers();
//   };

//   const handleCustomerPress = (customer) => {
//     navigation.navigate("Items", {
//       customerId: customer.entity_id,
//       customerName: customer.name,
//     });
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.itemContainer}
//       onPress={() => handleCustomerPress(item)}
//     >
//       <View
//         style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}
//       >
//         <Text style={styles.avatarText}>
//           {item.name.charAt(0).toUpperCase()}
//         </Text>
//       </View>

//       <View style={styles.infoContainer}>
//         <View style={styles.nameRow}>
//           <Text style={styles.name}>{item.name}</Text>
//         </View>
//         <Text style={styles.phone}>📞 {item.phone}</Text>
//         <Text style={styles.lastSeen}>Last Visit: {item.last_seen}</Text>
//       </View>

//       <View style={styles.iconContainer}>
//         <TouchableOpacity
//           onPress={() => toggleVisited(item.entity_id, item.visited)}
//         >
//           <View
//             style={[
//               styles.visitedBox,
//               {
//                 backgroundColor: item.visited === "Visited" ? "green" : "transparent",
//                 borderColor: item.visited === "Visited" ? "green" : "#888",
//               },
//             ]}
//           >
//             <Text
//               style={[
//                 styles.tick,
//                 { color: item.visited === "Visited" ? "#fff" : "#666" },
//               ]}
//             >
//               ✓
//             </Text>
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() =>
//             navigation.navigate("Live Tracking", {
//               customer: {
//                 id: item.entity_id,
//                 name: item.name,
//                 latitude: item.latitude,
//                 longitude: item.longitude,
//                 visited: item.visited,
//               },
//             })
//           }
//         >
//           <Feather
//             name="map-pin"
//             size={20}
//             color="#007bff"
//             style={{ marginTop: 6 }}
//           />
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
//       <View style={styles.container}>
//         {/* 🔍 Search Bar */}
//         <View style={styles.searchRow}>
//           <View style={styles.searchContainer}>
//             <TextInput
//               style={styles.searchBar}
//               placeholder="Search Customer..."
//               value={search}
//               onChangeText={handleSearch}
//             />
//             <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
//           </View>
//         </View>

//         {/* 🔘 Compact Filter Buttons */}
//         <View style={styles.filterContainer}>
//           {["all", "visited", "notVisited"].map((type, index) => (
//             <TouchableOpacity
//               key={type}
//               style={[
//                 styles.filterButton,
//                 filter === type && styles.activeFilter,
//                 index === 0 && styles.leftButton,
//                 index === 2 && styles.rightButton,
//               ]}
//               onPress={() => handleFilterChange(type)}
//             >
//               <Text
//                 style={[
//                   styles.filterText,
//                   filter === type && styles.activeFilterText,
//                 ]}
//               >
//                 {type === "all"
//                   ? "All"
//                   : type === "visited"
//                   ? "Visited"
//                   : "Not Visited"}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* 👥 Customer List */}
//         <FlatList
//           data={customers}
//           keyExtractor={(item) => item.entity_id.toString()}
//           renderItem={renderItem}
//           showsVerticalScrollIndicator={false}
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#f9fafb" },
//   container: {
//     flex: 1,
//     paddingTop: 10,
//     paddingHorizontal: 10,
//     backgroundColor: "#fff",
//   },

//   searchRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   searchContainer: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     backgroundColor: "#f9f9f9",
//   },
//   searchBar: {
//     flex: 1,
//     height: 40,
//   },
//   searchIcon: {
//     marginLeft: 10,
//   },

//   // ✅ Compact Filter Layout
//   filterContainer: {
//     flexDirection: "row",
//     marginBottom: 6,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 2,
//     overflow: "hidden",
//   },
//   filterButton: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 10,
//     backgroundColor: "#f8f9fa",
//     borderRightWidth: 1,
//     borderColor: "#ccc",
//   },
//   leftButton: {
//     borderTopLeftRadius: 2,
//     borderBottomLeftRadius: 2,
//   },
//   rightButton: {
//     borderTopRightRadius: 2,
//     borderBottomRightRadius: 2,
//     borderRightWidth: 0,
//   },
//   filterText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#444",
//   },
//   activeFilter: {
//     backgroundColor: "#007bff",
//   },
//   activeFilterText: {
//     color: "#fff",
//   },

//   itemContainer: {
//     flexDirection: "row",
//     padding: 10,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//     alignItems: "center",
//     borderRadius: 8,
//     marginBottom: 6,
//     backgroundColor: "#fff",
//     elevation: 1,
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 10,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarText: {
//     fontSize: 20,
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   infoContainer: { flex: 1 },
//   nameRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   name: {
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   phone: {
//     color: "#555",
//     marginTop: 2,
//   },
//   lastSeen: {
//     color: "#888",
//     fontSize: 12,
//     marginTop: 2,
//   },
//   iconContainer: {
//     alignItems: "center",
//     gap: 10,
//   },
//   visitedBox: {
//     width: 24,
//     height: 24,
//     borderRadius: 4,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   tick: {
//     fontWeight: "bold",
//     fontSize: 16,
//     textAlign: "center",
//   },
// });