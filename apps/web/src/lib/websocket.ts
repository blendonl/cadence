'use client';

import { io, Socket } from 'socket.io-client';
import { getQueryClient } from './query-client';

const WS_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      path: '/ws/changes',
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectWebSocket() {
  const ws = getSocket();
  if (!ws.connected) {
    ws.connect();
  }

  ws.on('entity:changed', (payload: { entity: string; action: string }) => {
    const queryClient = getQueryClient();
    const entityKeyMap: Record<string, string[]> = {
      project: ['projects'],
      board: ['boards'],
      column: ['boards'],
      task: ['tasks', 'boards'],
      note: ['notes'],
      goal: ['goals'],
      routine: ['routines'],
      'time-log': ['time-logs'],
      agenda: ['agenda'],
      'agenda-item': ['agenda'],
    };

    const keys = entityKeyMap[payload.entity] || [];
    keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  });

  return ws;
}

export function disconnectWebSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
