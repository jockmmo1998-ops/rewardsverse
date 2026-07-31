import { EventEmitter } from "events";

/**
 * SSE Event Manager - Manages real-time connections and broadcasts postback events
 * 
 * Architecture:
 * - Maintains a map of userId -> Set<Response> for active SSE connections
 * - When postback is processed, emits event to all connections of that user
 * - Client auto-refreshes profile and history when receiving event
 */

interface SSEConnection {
  userId: number;
  response: any; // Express Response object
}

class SSEEventManager extends EventEmitter {
  private connections: Map<number, Set<any>> = new Map(); // userId -> Set<Response>

  /**
   * Register a new SSE connection for a user
   */
  registerConnection(userId: number, response: any): void {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(response);

    console.log(`[SSE] User ${userId} connected. Total connections: ${this.connections.get(userId)!.size}`);

    // Handle client disconnect
    response.on("close", () => {
      this.unregisterConnection(userId, response);
    });
  }

  /**
   * Unregister SSE connection
   */
  private unregisterConnection(userId: number, response: any): void {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(response);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
      console.log(`[SSE] User ${userId} disconnected. Remaining connections: ${userConnections?.size || 0}`);
    }
  }

  /**
   * Send postback event to user
   */
  sendPostbackEvent(userId: number, data: {
    type: "postback";
    provider: string;
    amount: number;
    offerName: string;
    timestamp: string;
  }): void {
    const userConnections = this.connections.get(userId);
    if (!userConnections || userConnections.size === 0) {
      console.log(`[SSE] No active connections for user ${userId}`);
      return;
    }

    // Gửi cả 2 events: "postback" (notification) + "balance_update" (trigger re-fetch profile)
    const postbackMsg = `data: ${JSON.stringify(data)}\n\n`;
    const balanceMsg = `data: ${JSON.stringify({ type: "balance_update", timestamp: data.timestamp })}\n\n`;

    userConnections.forEach((response) => {
      try {
        response.write(postbackMsg);
        response.write(balanceMsg);
      } catch (error) {
        console.error(`[SSE] Error sending to user ${userId}:`, error);
        this.unregisterConnection(userId, response);
      }
    });

    console.log(`[SSE] Sent postback+balance_update events to user ${userId}: ${data.offerName} (+$${data.amount})`);
  }

  /**
   * Send generic event to user
   */
  sendEvent(userId: number, eventType: string, data: any): void {
    const userConnections = this.connections.get(userId);
    if (!userConnections || userConnections.size === 0) {
      return;
    }

    const message = `data: ${JSON.stringify({ type: eventType, ...data })}\n\n`;

    userConnections.forEach((response) => {
      try {
        response.write(message);
      } catch (error) {
        console.error(`[SSE] Error sending to user ${userId}:`, error);
        this.unregisterConnection(userId, response);
      }
    });
  }

  /**
   * Get number of active connections for a user
   */
  getConnectionCount(userId: number): number {
    return this.connections.get(userId)?.size || 0;
  }

  /**
   * Get total active connections across all users
   */
  getTotalConnections(): number {
    let total = 0;
    this.connections.forEach((conns) => {
      total += conns.size;
    });
    return total;
  }

  /**
   * Close all connections (for cleanup)
   */
  closeAll(): void {
    this.connections.forEach((userConnections) => {
      userConnections.forEach((response) => {
        try {
          response.end();
        } catch (error) {
          console.error("[SSE] Error closing connection:", error);
        }
      });
    });
    this.connections.clear();
    console.log("[SSE] All connections closed");
  }
}

// Export singleton instance
export const sseManager = new SSEEventManager();
