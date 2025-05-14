import { io } from "socket.io-client";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Only connect once
const socket = io(API_BASE_URL, { transports: ["websocket"] });

export default socket;
