import { Server } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { TileData } from '@/types/game'

export function initializeSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('tileAdded', (newTile: TileData) => {
      // Broadcast the new tile to all other clients
      socket.broadcast.emit('tileUpdate', newTile)
    })

    socket.on('tileUpdated', (updatedTile: TileData) => {
      // Broadcast the updated tile to all other clients
      socket.broadcast.emit('tileUpdate', updatedTile)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
} 