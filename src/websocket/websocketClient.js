let socket = null;

let reconnectTimer = null;

let currentAccessToken = null;

const WS_URL = import.meta.env.VITE_WS_URL;

export const connectWebSocket = (accessToken) => {
  if (!accessToken || !WS_URL) {
    return;
  }

  currentAccessToken = accessToken;

  if (socket && socket.readyState === WebSocket.OPEN) {
    return;
  }

  socket = new WebSocket(`${WS_URL}?token=${accessToken}`);

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      window.dispatchEvent(
        new CustomEvent("notification_received", {
          detail: data,
        }),
      );
    } catch (error) {
      console.error("Invalid websocket message", error);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");

    socket = null;

    clearTimeout(reconnectTimer);

    reconnectTimer = setTimeout(() => {
      if (currentAccessToken) {
        connectWebSocket(currentAccessToken);
      }
    }, 5000);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
};

export const disconnectWebSocket = () => {
  clearTimeout(reconnectTimer);

  currentAccessToken = null;

  if (socket) {
    socket.close();

    socket = null;
  }
};
