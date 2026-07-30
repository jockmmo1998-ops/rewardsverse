import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface PostbackEvent {
  type: "postback";
  provider: string;
  amount: number;
  offerName: string;
  timestamp: string;
}

export interface SSEEvent {
  type: "connected" | "postback" | "postback_error" | string;
  [key: string]: any;
}

interface UseSSEOptions {
  onPostback?: (event: PostbackEvent) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  enabled?: boolean;
}

/**
 * Hook for subscribing to real-time SSE notifications
 * 
 * Usage:
 * ```tsx
 * const { isConnected } = useSSE({
 *   onPostback: (event) => {
 *     console.log("Postback received:", event);
 *     // Auto-refresh profile/history here
 *   },
 * });
 * ```
 */
export function useSSE(options: UseSSEOptions = {}) {
  const { user } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 2000; // 2 seconds

  const {
    onPostback,
    onError,
    onConnected,
    enabled = true,
  } = options;

  const connect = useCallback(() => {
    if (!user || !user.id || !enabled) {
      return;
    }

    // Avoid duplicate connections
    if (eventSourceRef.current) {
      return;
    }

    const sseUrl = `/api/sse/subscribe?userId=${user.id}`;

    try {
      const eventSource = new EventSource(sseUrl);

      eventSource.addEventListener("open", () => {
        console.log("[SSE] Connection opened");
        isConnectedRef.current = true;
        reconnectAttemptsRef.current = 0;
        onConnected?.();
      });

      eventSource.addEventListener("message", (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);

          if (data.type === "connected") {
            console.log("[SSE] Connected message received");
          } else if (data.type === "postback") {
            console.log("[SSE] Postback event received:", data);
            onPostback?.(data as PostbackEvent);
          } else if (data.type === "postback_error") {
            console.warn("[SSE] Postback error:", data);
            onError?.(new Error(data.message || "Postback error"));
          } else {
            console.log("[SSE] Unknown event type:", data.type);
          }
        } catch (err) {
          console.error("[SSE] Failed to parse message:", err);
        }
      });

      eventSource.addEventListener("error", (event) => {
        console.error("[SSE] Connection error:", event);
        isConnectedRef.current = false;

        // Close the connection to trigger reconnect
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          console.error("[SSE] Max reconnection attempts reached");
          onError?.(new Error("Failed to establish SSE connection"));
        }
      });

      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error("[SSE] Failed to create EventSource:", err);
      onError?.(err instanceof Error ? err : new Error("Failed to create EventSource"));
    }
  }, [user, enabled, onPostback, onError, onConnected]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      isConnectedRef.current = false;
      console.log("[SSE] Disconnected");
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (enabled && user?.id) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, user?.id, connect, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    connect,
    disconnect,
  };
}
