import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// ⚠️ CHANGE THIS IF YOUR SERVER RUNS ON A DIFFERENT PORT
const SERVER_URL = "http://localhost:5000";

export const useSocket = () => {
  const socketRef = useRef();

  useEffect(() => {
    // 1. Initialize Connection
    socketRef.current = io(SERVER_URL);

    // 2. Debug Connection
    socketRef.current.on("connect", () => {
      console.log("✅ Connected to Socket Server:", socketRef.current.id);
    });

    // 3. Cleanup on Unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
};