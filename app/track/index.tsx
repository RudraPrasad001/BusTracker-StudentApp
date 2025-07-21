import StudentTrackingScreen from "@/components/tracker/StudentTrackingScreen";
import { useLocalSearchParams } from "expo-router";

const BusTracking = ()=>{
    const BUS_ID = useLocalSearchParams();
    return(
        <StudentTrackingScreen BUS_ID={BUS_ID} />
    )
}
export default BusTracking;