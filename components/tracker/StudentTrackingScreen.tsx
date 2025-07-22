import polyline from "@mapbox/polyline"; // install this
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import socket from "../../utils/socket";

export default function StudentTrackingScreen() {
  const { BUS_ID, stops: rawStops } = useLocalSearchParams();

  const [busLocation, setBusLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const mapRef = useRef<MapView>(null);

  const stops = useMemo(() => {
    try {
      return JSON.parse(rawStops as string);
    } catch (e) {
      console.error("❌ Error parsing stops:", e);
      return [];
    }
  }, [rawStops]);

  // Fetch road-following route using Google Directions API
  const fetchRoutePolyline = async () => {
    if (!stops || stops.length < 2) return;

    const origin = `${stops[0].latitude},${stops[0].longitude}`;
    const destination = `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`;

    const waypoints = stops
      .slice(1, -1)
      .map((s: any) => `${s.latitude},${s.longitude}`)
      .join("|");

    const apiKey = "AIzaSyBv3QFHgr3HK8N0x1aYrb7J67PUkMDYreo"; // Replace with your key
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoints}&key=${apiKey}`;

    try {
      const res = await axios.get(url);
      const encoded = res.data.routes[0]?.overview_polyline?.points;

      if (encoded) {
        const coords = polyline.decode(encoded).map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRouteCoords(coords);
      }
    } catch (err) {
      console.error("❌ Error fetching route polyline:", err);
    }
  };

  useEffect(() => {
    fetchRoutePolyline();
  }, [stops]);

  useEffect(() => {
    socket.connect();
    socket.emit("start-tracking", BUS_ID);

    socket.on("bus-location", (coords) => {
      console.log("📦 Location received:", coords);
      setBusLocation({
        latitude: parseFloat(coords.latitude),
        longitude: parseFloat(coords.longitude),
      });

      mapRef.current?.animateToRegion(
        {
          latitude: parseFloat(coords.latitude),
          longitude: parseFloat(coords.longitude),
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
          {/* Polyline of actual route from Google Directions */}
          <Polyline
            coordinates={routeCoords}
            strokeColor="#2563EB"
            strokeWidth={4}
          />

          {/* Bus marker */}
          <Marker coordinate={busLocation} title="🚌 Bus Location" />

          {/* Optional: markers at stops */}
          {stops.map((stop: any, index: number) => (
            <Marker
              key={index}
              coordinate={{
                latitude: parseFloat(stop.latitude),
                longitude: parseFloat(stop.longitude),
              }}
              title={`Stop ${index + 1}`}
              pinColor="green"
            />
          ))}
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
