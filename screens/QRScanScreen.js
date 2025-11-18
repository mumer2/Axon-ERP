import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet,Image, ImageBackground } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Feather,Ionicons  } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

export default function ScanQRScreen({navigation}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState("off");

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  if (!permission) return <View />;

   const handleContinue = () => {
    
      setTimeout(() => {
        navigation.navigate("MainTabs");
      }, 650);
    };
  
  return (
    <View style={styles.container}>
      {/* Full camera background */}
      <CameraView 
        style={styles.camera}
        facing="back"
        flash={flash}
      />

      {/* Overlay dim background */}
      <View style={styles.dimOverlay} />

      {/* Center card */}
      <BlurView intensity={20} tint="dark" style={styles.card}>
        <Text style={styles.title}>Scan to Login</Text>
        <Text style={styles.subtitle}>Place the QR code properly inside the area</Text>

        {/* QR dummy icon */}
        <Ionicons name="qr-code-outline" size={90} color="#fff" style={{ marginVertical: 20 }} />

        <TouchableOpacity style={styles.okBtn}>
          <Text style={styles.okText}>Ok</Text>
        </TouchableOpacity>
      </BlurView>

      {/* Flashlight button */}
      <TouchableOpacity 
        onPress={() => setFlash(flash === "off" ? "on" : "off")}
        style={styles.flashBtn}
      >
        <Feather name="zap" size={26} color="#fff" />
      </TouchableOpacity>

       <TouchableOpacity style={styles.button} onPress={handleContinue}>
                   <Text style={styles.buttonText}>Continue with</Text>
                   <Image 
                    source={require("../assets/Axon ERP.png")}
                    style={styles.icon}
                  />
                </TouchableOpacity>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  card: {
    width: 280,
    padding: 20,
    alignSelf: "center",
    marginTop: "70%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },

  okBtn: {
    backgroundColor: "#4678ff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 10,
  },
  okText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  flashBtn: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    padding: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 40,
  },

     button:{
    backgroundColor:"#676de3ff",
    width:"100%",
    paddingVertical:18,
    borderRadius:10,
    marginTop:30,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    gap:8
    
  },
  buttonText:{ color:"#ffffffff", fontSize:16, fontWeight:"400" },
  icon:{ width:82.07, height:20, resizeMode:"contain" },
});









// // QRScanScreen.js
// import { View, Text, StyleSheet,TouchableOpacity,Image } from "react-native";

// export default function QRScanScreen({ navigation }) {

//     const handleContinue = () => {
    
//       setTimeout(() => {
//         navigation.navigate("Home");
//       }, 650);
//     };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>Scan QR Code</Text>

//        <TouchableOpacity style={styles.button} onPress={handleContinue}>
//                   <Text style={styles.buttonText}>Continue with</Text>
//                   <Image 
//                     source={require("../assets/Axon ERP.png")}
//                     style={styles.icon}
//                   />
//                 </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   heading: {
//     fontSize: 24,
//     marginBottom: 20,
//     fontWeight: "bold",
//   },
//    button:{
//     backgroundColor:"#676de3ff",
//     width:"100%",
//     paddingVertical:18,
//     borderRadius:10,
//     marginTop:30,
//     flexDirection:"row",
//     justifyContent:"center",
//     alignItems:"center",
//     gap:8
    
//   },
//   buttonText:{ color:"#ffffffff", fontSize:16, fontWeight:"400" },
//   icon:{ width:82.07, height:20, resizeMode:"contain" },
// });
