import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 20e6 // 20MB for file uploads
})

interface User {
  id: string
  username: string
  roomId: string
}

interface Room {
  id: string
  code: string
  hostId: string
  users: Set<string>
  createdAt: Date
}

interface FileAttachment {
  name: string
  type: string
  size: number
  data: string
}

interface Message {
  id: string
  from: string
  to?: string
  content: string
  timestamp: Date
  type: 'public' | 'private' | 'system'
  roomId: string
  file?: FileAttachment
}

// Address/Location patterns to detect and warn about
const ADDRESS_PATTERNS = [
  // Street address patterns
  /\d+\s+[a-zA-Z\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|way|court|ct|place|pl|circle|cir)/gi,
  // Zip code patterns (US)
  /\b\d{5}(-\d{4})?\b/g,
  // UK postcodes
  /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/gi,
  // Coordinate patterns
  /\b-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+\b/g,
  // "I live at" or "my address" patterns
  /(?:i live at|my address is|my address|i live on|my house is at|my home is at)/gi,
  // Phone numbers
  /\b(?:\+?1[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g
]

// Check if message contains address-like content
const containsAddressInfo = (content: string): { hasAddress: boolean; warning?: string } => {
  for (const pattern of ADDRESS_PATTERNS) {
    if (pattern.test(content)) {
      return {
        hasAddress: true,
        warning: '⚠️ Your message appears to contain address/location information. For safety, please only share general location (country/region).'
      }
    }
  }
  return { hasAddress: false }
}

// Storage
const users = new Map<string, User>()
const rooms = new Map<string, Room>()
const codeToRoom = new Map<string, string>()

// Generate a random room code (6 characters)
const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Generate unique room code
const generateUniqueCode = (): string => {
  let code = generateRoomCode()
  let attempts = 0
  while (codeToRoom.has(code) && attempts < 100) {
    code = generateRoomCode()
    attempts++
  }
  return code
}

// Generate message ID
const generateMessageId = () => Math.random().toString(36).substr(2, 9)

// Create system message
const createSystemMessage = (content: string, roomId: string): Message => ({
  id: generateMessageId(),
  from: 'System',
  content,
  timestamp: new Date(),
  type: 'system',
  roomId
})

io.on('connection', (socket) => {
  console.log(`[Connect] User connected: ${socket.id}`)

  // Create a new room (host)
  socket.on('create-room', (data: { username: string }) => {
    const { username } = data
    const code = generateUniqueCode()
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const room: Room = {
      id: roomId,
      code,
      hostId: socket.id,
      users: new Set([socket.id]),
      createdAt: new Date()
    }
    
    rooms.set(roomId, room)
    codeToRoom.set(code, roomId)
    
    const user: User = {
      id: socket.id,
      username,
      roomId
    }
    
    users.set(socket.id, user)
    socket.join(roomId)
    
    console.log(`[Create Room] ${username} created room ${code} (${roomId})`)
    
    socket.emit('room-created', {
      roomCode: code,
      roomId,
      isHost: true
    })
    
    // Send welcome message
    const welcomeMsg = createSystemMessage(`Welcome! Your room code is: ${code}. Share this code with friends to let them join.`, roomId)
    socket.emit('message', welcomeMsg)
  })

  // Join an existing room
  socket.on('join-room', (data: { username: string; roomCode: string }) => {
    const { username, roomCode } = data
    const roomId = codeToRoom.get(roomCode.toUpperCase())
    
    if (!roomId) {
      socket.emit('error', { message: 'Invalid room code. Please check and try again.' })
      return
    }
    
    const room = rooms.get(roomId)
    if (!room) {
      socket.emit('error', { message: 'Room not found. It may have expired.' })
      return
    }
    
    const user: User = {
      id: socket.id,
      username,
      roomId
    }
    
    users.set(socket.id, user)
    room.users.add(socket.id)
    socket.join(roomId)
    
    console.log(`[Join Room] ${username} joined room ${roomCode} (${roomId})`)
    
    // Notify the joiner
    socket.emit('room-joined', {
      roomId,
      roomCode: roomCode.toUpperCase(),
      isHost: room.hostId === socket.id
    })
    
    // Send welcome message to joiner
    const welcomeMsg = createSystemMessage(`You joined the room! Say hello to everyone.`, roomId)
    socket.emit('message', welcomeMsg)
    
    // Notify others in the room
    const joinMsg = createSystemMessage(`${username} has joined the chat!`, roomId)
    socket.to(roomId).emit('message', joinMsg)
    socket.to(roomId).emit('user-joined', { user: { id: socket.id, username } })
    
    // Send updated user list to all in room
    const usersInRoom = Array.from(room.users)
      .map(id => users.get(id))
      .filter(u => u !== undefined)
      .map(u => ({ id: u!.id, username: u!.username }))
    
    io.to(roomId).emit('users-update', { users: usersInRoom })
  })

  // Send message to room
  socket.on('send-message', (data: { content: string; file?: FileAttachment }) => {
    const user = users.get(socket.id)
    if (!user) {
      socket.emit('error', { message: 'You are not in a room.' })
      return
    }
    
    const { content, file } = data
    
    // Check for address information in text content
    const addressCheck = containsAddressInfo(content)
    if (addressCheck.hasAddress) {
      socket.emit('warning', { message: addressCheck.warning })
    }
    
    const message: Message = {
      id: generateMessageId(),
      from: user.username,
      content,
      timestamp: new Date(),
      type: 'public',
      roomId: user.roomId,
      file
    }
    
    console.log(`[Message] ${user.username} in room ${user.roomId}: ${content}${file ? ` [File: ${file.name}]` : ''}`)
    
    // Broadcast to everyone in the room including sender
    io.to(user.roomId).emit('message', message)
  })

  // Send private message
  socket.on('send-private-message', (data: { toUserId: string; content: string; file?: FileAttachment }) => {
    const sender = users.get(socket.id)
    const recipient = users.get(data.toUserId)
    
    if (!sender || !recipient) {
      socket.emit('error', { message: 'User not found.' })
      return
    }
    
    const { content, file } = data
    
    // Check for address information
    const addressCheck = containsAddressInfo(content)
    if (addressCheck.hasAddress) {
      socket.emit('warning', { message: addressCheck.warning })
    }
    
    const message: Message = {
      id: generateMessageId(),
      from: sender.username,
      to: recipient.username,
      content,
      timestamp: new Date(),
      type: 'private',
      roomId: sender.roomId,
      file
    }
    
    console.log(`[Private] ${sender.username} -> ${recipient.username}: ${content}${file ? ` [File: ${file.name}]` : ''}`)
    
    // Send to recipient
    io.to(data.toUserId).emit('private-message', { 
      message,
      fromUserId: socket.id,
      fromUsername: sender.username
    })
    
    // Also send back to sender so they can see their own message
    socket.emit('private-message', {
      message,
      fromUserId: socket.id,
      fromUsername: sender.username,
      toUsername: recipient.username
    })
  })

  // Get users in room
  socket.on('get-users', () => {
    const user = users.get(socket.id)
    if (!user) return
    
    const room = rooms.get(user.roomId)
    if (!room) return
    
    const usersInRoom = Array.from(room.users)
      .map(id => users.get(id))
      .filter(u => u !== undefined)
      .map(u => ({ id: u!.id, username: u!.username }))
    
    socket.emit('users-update', { users: usersInRoom })
  })

  // Typing indicator
  socket.on('typing', () => {
    const user = users.get(socket.id)
    if (user) {
      socket.to(user.roomId).emit('user-typing', { username: user.username })
    }
  })

  socket.on('stop-typing', () => {
    const user = users.get(socket.id)
    if (user) {
      socket.to(user.roomId).emit('user-stop-typing', { username: user.username })
    }
  })

  // Leave room
  socket.on('leave-room', () => {
    handleDisconnect(socket.id)
  })

  // Disconnect
  socket.on('disconnect', () => {
    handleDisconnect(socket.id)
  })

  socket.on('error', (error) => {
    console.error(`[Error] Socket error (${socket.id}):`, error)
  })
})

function handleDisconnect(socketId: string) {
  const user = users.get(socketId)
  
  if (user) {
    const room = rooms.get(user.roomId)
    
    if (room) {
      room.users.delete(socketId)
      
      // Notify others
      const leaveMsg = createSystemMessage(`${user.username} has left the chat.`, user.roomId)
      io.to(user.roomId).emit('message', leaveMsg)
      io.to(user.roomId).emit('user-left', { userId: socketId, username: user.username })
      
      // Update user list
      const usersInRoom = Array.from(room.users)
        .map(id => users.get(id))
        .filter(u => u !== undefined)
        .map(u => ({ id: u!.id, username: u!.username }))
      
      io.to(user.roomId).emit('users-update', { users: usersInRoom })
      
      // If host left and room is empty, or if room is empty, clean up
      if (room.users.size === 0) {
        codeToRoom.delete(room.code)
        rooms.delete(user.roomId)
        console.log(`[Cleanup] Room ${room.code} deleted (empty)`)
      } else if (room.hostId === socketId) {
        // Transfer host to next user
        const newHostId = Array.from(room.users)[0]
        if (newHostId) {
          room.hostId = newHostId
          io.to(newHostId).emit('host-transferred')
          const hostMsg = createSystemMessage(`You are now the host of this room.`, user.roomId)
          io.to(newHostId).emit('message', hostMsg)
        }
      }
    }
    
    users.delete(socketId)
    console.log(`[Disconnect] ${user.username} disconnected`)
  } else {
    console.log(`[Disconnect] Unknown user disconnected: ${socketId}`)
  }
}

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[Server] WebSocket Chat Server running on port ${PORT}`)
  console.log(`[Server] Ready for connections!`)
  console.log(`[Server] Features: File uploads (up to 20MB), Address detection`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] Received SIGTERM, shutting down...')
  httpServer.close(() => {
    console.log('[Server] WebSocket server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[Server] Received SIGINT, shutting down...')
  httpServer.close(() => {
    console.log('[Server] WebSocket server closed')
    process.exit(0)
  })
})
