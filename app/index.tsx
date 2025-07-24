import CONSTANTS from "@/constants/constants";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type Stop = {
  stop_id: number;
  stop_name: string;
  bus_number: number;
  latitude: string;
  longitude: string;
  sequence_number: number;
};
type Bus = {
  bus_id: number;
  is_online: boolean;
  bus_number: number;
  route_name: string;
  number_plate: string;
  stops: Stop[];
};

export default function Index() {
  const [routeNumber, setRouteNumber] = useState("");
  const [liveBuses, setLiveBuses] = useState<Bus[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleNavigate = async (busNumberParam?: string, stopsParamStr?: string) => {
    const numberToSearch = busNumberParam || routeNumber.trim();

    if (numberToSearch === "") {
      Alert.alert("Please enter a valid route number.");
      return;
    }

    try {
      const res = await axios.get(`${CONSTANTS.HOST}/get/busbyno/${numberToSearch}`);
      if (res.data.success) {
        const stops = res.data.bus.stops;
        const stopsParam = stopsParamStr || JSON.stringify(stops);
        router.push({
          pathname: "/track",
          params: { BUS_ID: numberToSearch, stops: stopsParam },
        });
      } else {
        Alert.alert("Error", "Bus does not exist");
      }
    } catch (e) {
      Alert.alert("Error", "Could not fetch bus data.");
    }
  };

const fetchLiveBuses = async () => {
  setLoading(true);
  setSearchQuery(""); // 👈 reset any previous search
 // 👈 clear previous list
  try {
    const res = await axios.get(`${CONSTANTS.HOST}/get/onlinebus`);
    if (res.data.success) {
      setLiveBuses([...res.data.buses]);
    }
    else{
        setLiveBuses([]);  
    }
  } catch (e) {
    console.error("Error fetching live buses:", e);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchLiveBuses();
  }, []);

  const filteredBuses = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return liveBuses.filter(
      (bus) =>
        bus.bus_number.toString().includes(query) ||
        bus.route_name.toLowerCase().includes(query)
    );
  }, [searchQuery, liveBuses]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Enter Bus Route Number</Text>

      <TextInput
        value={routeNumber}
        onChangeText={setRouteNumber}
        placeholder="e.g. 101"
        keyboardType="number-pad"
        maxLength={5}
        style={styles.input}
      />

      <Button title="Track Bus" onPress={() => handleNavigate()} />

      <View style={styles.liveHeader}>
        <Text style={styles.liveTitle}>Live Buses</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchLiveBuses}>
          <Text style={styles.refreshText}>⟳ Refresh</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by bus number or route name"
        style={styles.searchInput}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.busList}>
  {filteredBuses.length === 0 ? (
    <Text style={{ textAlign: "center", marginTop: 20, color: "#888" }}>
      No matching buses found.
    </Text>
  ) : (
    filteredBuses.map((item) => {
      const stopsParam = JSON.stringify(item.stops);
      return (
        <TouchableOpacity
          key={item.bus_id}
          style={styles.busCard}
          onPress={() => handleNavigate(item.bus_number.toString(), stopsParam)}
        >
          <Text style={styles.busTitle}>🚌 Bus #{item.bus_number}</Text>
          <Text style={styles.routeName}>{item.route_name}</Text>
          <Text style={styles.plate}>Plate: {item.number_plate}</Text>
        </TouchableOpacity>
      );
    })
  )}
</ScrollView>

      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#F8FAFD",
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  liveHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 30,
  },
  liveTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2563EB",
  },
  refreshBtn: {
    backgroundColor: "#E5EFFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "500",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  busList: {
    paddingBottom: 20,
  },
  busCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  busTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  routeName: {
    fontSize: 16,
    marginTop: 4,
    color: "#555",
  },
  plate: {
    fontSize: 14,
    marginTop: 2,
    color: "#888",
  },
});
