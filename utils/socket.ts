import { io } from "socket.io-client";

const socket = io("http://10.209.200.95:3000", {
  transports: ["websocket"],
  autoConnect: false,
});

export default socket;
