// QRScanScreen.js
import { View, Text, StyleSheet,TouchableOpacity,Image } from "react-native";

export default function QRScanScreen({ navigation }) {

    const handleContinue = () => {
    
      setTimeout(() => {
        navigation.navigate("Home");
      }, 650);
    };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Scan QR Code</Text>

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
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
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
