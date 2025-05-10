import { io } from "socket.io-client";

// Only connect once
const socket = io("http://localhost:3000", { transports: ["websocket"] });

export default socket;
