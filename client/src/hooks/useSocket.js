import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

export function useSocket({ workflowId, user, onMessage, onTyping, onStopTyping }) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!workflowId || !user?.cflow_id) return;

    const socket = io("http://localhost:4000", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_workflow", { workflow_id: workflowId, user });
    });

    socket.on("receive_message", (msg) => {
      onMessage?.(msg);
    });

    socket.on("user_typing", (data) => {
      onTyping?.(data);
    });

    socket.on("user_stop_typing", (data) => {
      onStopTyping?.(data);
    });

    socket.on("error_event", (err) => {
      console.error("[Socket] Server error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [workflowId, user?.cflow_id, onMessage, onTyping, onStopTyping]);

  const sendMessage = useCallback((message) => {
    socketRef.current?.emit("send_message", { message });
  }, []);

  const emitTyping = useCallback(() => {
    socketRef.current?.emit("typing");
  }, []);

  const emitStopTyping = useCallback(() => {
    socketRef.current?.emit("stop_typing");
  }, []);

  return { sendMessage, emitTyping, emitStopTyping };
}