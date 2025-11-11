import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getRecentActivities } from "../database";

export default function RecentActivitySection() {
  const [activities, setActivities] = useState([]);
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");

  const fetchActivities = async () => {
    try {
      const data = await getRecentActivities();
      const mappedData = data.map((item) => ({
        id: item.id,
        title: `Order #${item.booking_id}`,
        desc: `${item.item_count} items purchased, Total Rs.${item.total_amount?.toFixed(2) ?? 0}`,
        date: item.activity_date ? new Date(item.activity_date).toLocaleDateString() : "",
        day: item.activity_date ? new Date(item.activity_date).toLocaleDateString("en-US", { weekday: "short" }) : "",
        bg: "#D9F7E5",
        icon: (
          <Image
            source={require("../assets/Icons/LeadStatus.png")}
            style={styles.icon}
          />
        ),
      }));
      setActivities(mappedData.reverse().slice(0, 4)); // latest 4
    } catch (error) {
      console.error("Error fetching recent activities:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActivities();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Activity</Text>
        <TouchableOpacity
          style={styles.seeMoreButton}
          onPress={() => navigation.navigate("Recent Activities")}
        >
          <Text style={styles.seeMoreText}>See more</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {activities.length > 0 ? (
          activities.map((item) => (
            <View key={item.id} style={[styles.card, { width: width - 30 }]}>
              <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
                {item.icon}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.desc}
                </Text>
              </View>
              <View style={styles.dateContainer}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.day}>{item.day}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent activity yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#2D99FF",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#fff", flexShrink: 1 },
  seeMoreButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  seeMoreText: { color: "gray", fontSize: 12, fontWeight: "500" },

  scrollContainer: {
    paddingBottom: 10,
    gap: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dotted",
    borderColor: "#E3E3E3",
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#000" },
  cardDesc: { fontSize: 10, color: "#666", marginTop: 2 },
  dateContainer: { alignItems: "flex-end",gap:10 },
  date: { fontSize: 12, color: "gray", fontWeight: "600" },
  day: { fontSize: 11, color: "#888" },
  icon: { width: 26, height: 26, resizeMode: "contain" },
  emptyText: { textAlign: "center", color: "#fff", marginTop: 10, fontSize: 14 },
});


// import React, { useState, useCallback } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
// import { useFocusEffect, useNavigation } from "@react-navigation/native";
// import { getRecentActivities } from "../database";

// export default function RecentActivitySection() {
//   const [activities, setActivities] = useState([]);
//   const navigation = useNavigation();

//   const fetchActivities = async () => {
//     try {
//       const data = await getRecentActivities();
//       const mappedData = data.map((item) => ({
//         id: item.id,
//         title: `Order #${item.booking_id}`,
//         desc: `${item.item_count} items purchased, Total Rs.${item.total_amount?.toFixed(2) ?? 0}`,
//         date: item.activity_date ? new Date(item.activity_date).toLocaleDateString() : "",
//         day: item.activity_date ? new Date(item.activity_date).toLocaleDateString("en-US", { weekday: "short" }) : "",
//         bg: "#D9F7E5",
//         icon: (
//           <Image
//             source={require("../assets/Icons/LeadStatus.png")}
//             style={styles.icon}
//           />
//         ),
//       }));
//       setActivities(mappedData.reverse().slice(0, 4)); // latest 4
//     } catch (error) {
//       console.error("Error fetching recent activities:", error);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchActivities();
//     }, [])
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Recent Activity</Text>
//         <TouchableOpacity
//           style={styles.seeMoreButton}
//           onPress={() => navigation.navigate("Recent Activities")}
//         >
//           <Text style={styles.seeMoreText}>See more</Text>
//         </TouchableOpacity>
//       </View>

//       {activities.length > 0 ? (
//         <View>
//           {activities.map((item) => (
//             <View key={item.id} style={styles.card}>
//               <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
//                 {item.icon}
//               </View>
//               <View style={styles.textContainer}>
//                 <Text style={styles.cardTitle}>{item.title}</Text>
//                 <Text style={styles.cardDesc}>{item.desc}</Text>
//               </View>
//               <View style={styles.dateContainer}>
//                 <Text style={styles.date}>{item.date}</Text>
//                 <Text style={styles.day}>{item.day}</Text>
//               </View>
//             </View>
//           ))}
//         </View>
//       ) : (
//         <Text style={styles.emptyText}>No recent activity yet.</Text>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 15, backgroundColor: "#2D99FF", paddingBottom: 25 },
//   header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
//   title: { fontSize: 18, fontWeight: "bold", color: "#fff" },
//   seeMoreButton: { backgroundColor: "#FFFFFF", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
//   seeMoreText: { color: "gray", fontSize: 12, fontWeight: "500" },
//   card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 15, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderStyle: "dotted", borderColor: "#E3E3E3" },
//   iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
//   textContainer: { flex: 1, marginLeft: 12 },
//   cardTitle: { fontSize: 16, fontWeight: "600", color: "#000" },
//   cardDesc: { fontSize: 10, color: "#666", marginTop: 2 },
//   dateContainer: { alignItems: "flex-end", gap: 16 },
//   date: { fontSize: 12, color: "gray", fontWeight: "600" },
//   day: { fontSize: 11, color: "#888" },
//   icon: { width: 26, height: 26, resizeMode: "contain" },
//   emptyText: { textAlign: "center", color: "#fff", marginTop: 20, fontSize: 14 },
// });




// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

// export default function RecentActivitySection() {
//   const data = [
//     {
//       icon: (
//         <Image
//           source={require("../assets/Icons/NewClient.png")}
//           style={styles.icon}
//         />
//       ),
//       bg: "#FFE7D3",
//       title: "New Client Added",
//       desc: "New client Skyline Solutions added by Ahmad Ali",
//       date: "10/9/25",
//       day: "Wed",
//     },
//     {
//       icon: (
//         <Image
//           source={require("../assets/Icons/InvoiceSent.png")}
//           style={styles.icon}
//         />
//       ),
//       bg: "#D9F7E5",
//       title: "Invoice sent",
//       desc: "Invoice #240 sent to Digital Pro Agency",
//       date: "10/9/25",
//       day: "Wed",
//     },
//     {
//       icon: (
//         <Image
//           source={require("../assets/Icons/LeadStatus.png")}
//           style={styles.icon}
//         />
//       ),
//       bg: "#FFD9DE",
//       title: "Lead Status Updated",
//       desc: "Lead Sana Traders moved to Negotiation Stage",
//       date: "10/9/25",
//       day: "Wed",
//     },
//   ];

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.title}>Recent Activity</Text>
//         <TouchableOpacity style={styles.seeMoreButton}>
//           <Text style={styles.seeMoreText}>See more</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Activity Cards */}
//       {data.map((item, index) => (
//         <View key={index} style={styles.card}>
//           {/* Icon */}
//           <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
//             {item.icon}
//           </View>

//           {/* Text */}
//           <View style={styles.textContainer}>
//             <Text style={styles.cardTitle}>{item.title}</Text>
//             <Text style={styles.cardDesc}>{item.desc}</Text>
//           </View>

//           {/* Date */}
//           <View style={styles.dateContainer}>
//             <Text style={styles.date}>{item.date}</Text>
//             <Text style={styles.day}>{item.day}</Text>
//           </View>
//         </View>
//       ))}
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     padding: 15,
//     backgroundColor: "#2D99FF", // blue background
//     paddingBottom: 25,
//   },

//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 15,
//   },

//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//   },

//   seeMoreButton: {
//     backgroundColor: "#FFFFFF",
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 20,
//   },

//   seeMoreText: {
//     color: "gray",
//     fontSize: 12,
//     fontWeight: "500",
//   },

//   card: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderStyle: "dotted",
//     borderColor: "#E3E3E3",
//   },

//   iconContainer: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   textContainer: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   cardTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#000",
//   },

//   cardDesc: {
//     fontSize: 10,
//     color: "#666",
//     marginTop: 2,
//   },

//   dateContainer: {
//     alignItems: "flex-end",
//     gap: 16,
//   },

//   date: {
//     fontSize: 12,
//     color: "gray",
//     fontWeight: "600",
//   },

//   day: {
//     fontSize: 11,
//     color: "#888",
//   },

//   icon: { width: 26, height: 26, resizeMode: "contain" },
// });
