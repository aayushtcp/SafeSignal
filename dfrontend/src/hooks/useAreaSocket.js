import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_URL, getAreaWsUrl, normalizeAreaName } from "../context/myurl";

async function getFreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) {
    return localStorage.getItem("access_token");
  }
  try {
    const { data } = await axios.post(
      `${API_URL}/token/refresh/`,
      { refresh },
      { headers: { "Content-Type": "application/json" } }
    );
    localStorage.setItem("access_token", data.access);
    if (data.refresh) {
      localStorage.setItem("refresh_token", data.refresh);
    }
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;
    return data.access;
  } catch {
    return localStorage.getItem("access_token");
  }
}

/**
 * One WebSocket per area — receives {type:"chat"|"alert"|"history"|"error"}.
 */
export function useAreaSocket(areaName) {
  const [status, setStatus] = useState("idle"); // idle | connecting | open | closed | error
  const [messages, setMessages] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [error, setError] = useState("");
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const area = normalizeAreaName(areaName);
  const intentionalClose = useRef(false);

  const pushMessage = useCallback((item) => {
    setMessages((prev) => {
      if (item.id != null && prev.some((m) => m.id === item.id && m.type === item.type)) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const connect = useCallback(async () => {
    if (!area) return;
    intentionalClose.current = false;
    setStatus("connecting");
    setError("");

    const token = await getFreshAccessToken();
    if (!token) {
      setStatus("error");
      setError("Not logged in — please sign in to use area chat.");
      return;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        /* ignore */
      }
    }

    const url = getAreaWsUrl(area, token);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("open");
      setError("");
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (data.type === "history" && Array.isArray(data.messages)) {
        setMessages(data.messages);
        const lastAlert = [...data.messages].reverse().find((m) => m.type === "alert");
        if (lastAlert) setActiveAlert(lastAlert);
        return;
      }

      if (data.type === "chat") {
        pushMessage(data);
        return;
      }

      if (data.type === "alert") {
        pushMessage(data);
        setActiveAlert(data);
        return;
      }

      if (data.type === "error") {
        setError(data.error || "Socket error");
      }
    };

    ws.onerror = () => {
      setStatus("error");
      setError("WebSocket connection failed");
    };

    ws.onclose = (ev) => {
      setStatus("closed");
      wsRef.current = null;
      if (ev.code === 4001) {
        setError("Unauthorized — log in again.");
        return;
      }
      if (!intentionalClose.current) {
        reconnectTimer.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };
  }, [area, pushMessage]);

  const disconnect = useCallback(() => {
    intentionalClose.current = true;
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus("closed");
  }, []);

  const sendChat = useCallback((message) => {
    const text = (message || "").trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    wsRef.current.send(JSON.stringify({ type: "chat", message: text }));
    return true;
  }, []);

  const dismissAlert = useCallback(() => setActiveAlert(null), []);

  useEffect(() => {
    setMessages([]);
    setActiveAlert(null);
    connect();
    return () => {
      intentionalClose.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return {
    status,
    messages,
    activeAlert,
    error,
    sendChat,
    dismissAlert,
    reconnect: connect,
    disconnect,
    area,
  };
}
