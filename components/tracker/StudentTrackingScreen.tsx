import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import socket from "../../utils/socket";

export default function StudentTrackingScreen({BUS_ID}:any) {
    
  const [busLocation, setBusLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    socket.connect();
    socket.emit("start-tracking", BUS_ID);

    socket.on("bus-location", (coords) => {
      console.log("📦 Location received:", coords);
      setBusLocation(coords);

      mapRef.current?.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    });

    return () => {
      socket.disconnect();
      socket.off("bus-location");
    };
  }, []);

  return (
    <View style={styles.container}>
      {busLocation ? (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: busLocation.latitude,
            longitude: busLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={busLocation} title="🚌 Bus Location" />
        </MapView>
      ) : (
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
          <Text>Waiting for bus location...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});