import { router } from "expo-router";
import { useState } from "react";
import { Alert, Button, KeyboardAvoidingView, Platform, Text, TextInput } from "react-native";

export default function Index() {
  const [routeNumber, setRouteNumber] = useState("");

  const handleNavigate = () => {
    if (routeNumber.trim() === "") {
      Alert.alert("Please enter a valid route number.");
      return;
    }

    // Optional: validate route number format here

    router.push({pathname:"/track",params:{BUS_ID:routeNumber}});
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
