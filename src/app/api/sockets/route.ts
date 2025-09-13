// src/app/api/socket/route.ts

import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { Server as IOServer } from 'socket.io';

// Add a custom type to the NextApiResponse to include the socket
interface NextApiResponseWithSocket extends NextApiResponse {
  socket: NetSocket & {
    server: HTTPServer & {
      io: IOServer;
    };
  };
}

// This is our main API route handler
export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    // This is the logic from your old src/lib/socket.ts file
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('message', (msg: { text: string; senderId: string }) => {
        socket.emit('message', {
          text: `Echo from Serverless: ${msg.text}`,
          senderId: 'system',
          timestamp: new Date().toISOString(),
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

      socket.emit('message', {
        text: 'Welcome to WebSocket Echo Server on Vercel!',
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });
  }
  res.end();
}