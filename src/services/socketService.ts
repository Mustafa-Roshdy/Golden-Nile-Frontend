import { io, Socket } from 'socket.io-client';

// Load the backend socket URL from environment variables or fallback to port 8000
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://golden-nile-backend.vercel.app';

/**
 * SocketService: Singleton class to manage the Socket.io client connection.
 */
class SocketService {
    private socket: Socket | null = null;

    /**
     * Initializes the socket connection if it doesn't already exist.
     */
    connect() {
        if (this.socket) return this.socket;

        // WebSockets are not supported on Vercel Serverless Functions.
        // Disabling connection to prevent errors.
        console.warn("Socket.io disabled: Not supported on Vercel serverless environment.");
        return null;

        /*
        this.socket = io(SOCKET_URL, {
            transports: ['websocket'], // Use WebSocket as the primary transport for low latency
            withCredentials: true,
        });
        */

        // Basic event listeners for debugging and state management
        this.socket.on('connect', () => {
        });

        this.socket.on('connect_error', (error) => {
        });

        this.socket.on('disconnect', (reason) => {
        });

        return this.socket;
    }

    /**
     * Returns the current socket instance.
     */
    getSocket() {
        return this.socket;
    }

    /**
     * Gracefully disconnects and cleans up listeners.
     */
    disconnect() {
        if (this.socket) {
            console.log('🔌 Socket disconnecting...');
            this.socket.removeAllListeners();
            this.socket.close();
            this.socket = null;
        }
    }
}

// Export a single instance to be used across the application
export const socketService = new SocketService();
