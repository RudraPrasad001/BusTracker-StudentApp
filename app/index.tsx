import CONSTANTS from "@/constants/constants";
import axios from "axios";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Button, KeyboardAvoidingView, Platform, Text, TextInput } from "react-native";

type Stop = {
  stop_id: number,
  stop_name: string,
  bus_number: number,
  latitude: number,
  longitude: number,
  sequence_number: number
}
type Stops = Stop[];

export default function Index() {
  const [routeNumber, setRouteNumber] = useState("");

  const handleNavigate =async () => {
    if (routeNumber.trim() === "") {
      Alert.alert("Please enter a valid route number.");
      return;
    }
    try{
    const res = await axios.get(`${CONSTANTS.HOST}/get/busbyno/${routeNumber}`);
    if(res.data.success){
      const stops = res.data.bus.stops;
      const stopsParam = JSON.stringify(stops);
      console.log("STOPS PARAM BELOW")
      console.log(stopsParam);
      router.push({pathname:"/track",params:{BUS_ID:routeNumber,stops:stopsParam}});
    }
    else{
      Alert.alert("Error","Bus does not exist")
    }}
    catch(e){
      Alert.alert("Error",e as string);
    }

    // Optional: validate route number format here

  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Enter Bus Route Number</Text>

      <TextInput
        value={routeNumber}
        onChangeText={setRouteNumber}
        placeholder="e.g. 101"
        keyboardType="number-pad"
        maxLength={5}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          width: "60%",
          padding: 10,
          fontSize: 20,
          textAlign: "center",
          marginBottom: 20,
        }}
      />

      <Button title="Track Bus" onPress={handleNavigate} />
    </KeyboardAvoidingView>
  );
}
