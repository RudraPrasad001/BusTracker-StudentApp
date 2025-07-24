import CONSTANTS from "@/constants/constants";
import { io } from "socket.io-client";

const socket = io(CONSTANTS.HOST, {
  transports: ["websocket"],
  autoConnect: false,
});

export default socket;
