import { io } from 'socket.io-client';

// Determine the socket server URL dynamically to support local network mobile testing and production
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '').replace(/\/api$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    const hostname = window.location.hostname;
    const isLocal = /^(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(hostname);
    if (isLocal) {
      return `http://${hostname}:5000`;
    }
  }
  return 'https://sportstek.onrender.com';
};

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    const url = getSocketUrl();
    socketInstance = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected to server:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('⚠️ Socket connection error:', err.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });
  }

  return socketInstance;
};

export const joinTournamentRoom = (tournamentId) => {
  if (!tournamentId) return;
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('join:tournament', tournamentId);
  } else {
    socket.once('connect', () => {
      socket.emit('join:tournament', tournamentId);
    });
  }
};

export const leaveTournamentRoom = (tournamentId) => {
  if (!tournamentId) return;
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('leave:tournament', tournamentId);
  }
};

export default getSocket;
