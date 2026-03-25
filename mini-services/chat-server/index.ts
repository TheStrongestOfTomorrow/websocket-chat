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

interface Reaction {
  emoji: string
  userIds: string[]
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
  reactions: Reaction[]
  edited?: boolean
  editedAt?: Date
  deleted?: boolean
}

// Address/Location patterns to detect and BLOCK for user safety
// These patterns detect SPECIFIC addresses, not general locations like country/state
const ADDRESS_PATTERNS = [
  // Street address patterns (e.g., "123 Main Street", "456 Oak Ave")
  /\d+\s+[a-zA-Z]+\s+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|way|court|ct|place|pl|circle|cir|terrace|ter|parkway|pkwy|highway|hwy)/gi,
  // Apartment/Unit numbers (e.g., "Apt 4B", "Unit 12")
  /(?:apartment|apt|unit|suite|ste|room|rm|#)\s*[a-zA-Z0-9]+/gi,
  // US ZIP codes (5 digits or ZIP+4)
  /\b\d{5}(?:[-\s]\d{4})?\b/g,
  // UK postcodes (e.g., "SW1A 1AA", "M1 1AA")
  /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi,
  // Canadian postal codes (e.g., "K1A 0B1")
  /\b[A-Z]\d[A-Z]\s*\d[A-Z]\d\b/gi,
  // GPS Coordinates (e.g., "40.7128, -74.0060")
  /\b-?\d{1,3}\.\d{4,},\s*-?\d{1,3}\.\d{4,}\b/g,
  // "I live at" / "my address" patterns (explicit sharing)
  /\b(?:i\s+(?:live|stay|reside)\s+(?:at|on|in\s+the\s+(?:house|apartment|building))\s+\d)/gi,
  /\b(?:my\s+(?:address|home|house|location)\s+(?:is|at))\s+\d/gi,
  // Phone numbers (US/International)
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  // International phone patterns
  /\b\+?\d{1,3}[-.\s]?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,
  // Building numbers with street names (e.g., "building 5 on Main")
  /(?:building|bldg)\s*\d+\s+(?:on|at|near)/gi,
]

// Words that indicate GENERAL location (ALLOWED - these are safe)
const ALLOWED_LOCATION_WORDS = [
  // Countries
  'usa', 'united states', 'america', 'uk', 'united kingdom', 'england', 'scotland', 'wales', 
  'canada', 'australia', 'new zealand', 'germany', 'france', 'spain', 'italy', 'japan', 
  'china', 'india', 'brazil', 'mexico', 'russia', 'south korea', 'korea', 'indonesia',
  'philippines', 'vietnam', 'thailand', 'singapore', 'malaysia', 'netherlands', 'belgium',
  'sweden', 'norway', 'denmark', 'finland', 'poland', 'portugal', 'greece', 'turkey',
  'south africa', 'egypt', 'nigeria', 'kenya', 'israel', 'saudi arabia', 'uae', 'dubai',
  'argentina', 'chile', 'colombia', 'peru', 'pakistan', 'bangladesh', 'iran', 'iraq',
  // Continents/Regions
  'europe', 'asia', 'africa', 'north america', 'south america', 'oceania', 'antarctica',
  'middle east', 'southeast asia', 'central america', 'caribbean', 'pacific', 'atlantic',
  'east', 'west', 'north', 'south', 'northern', 'southern', 'eastern', 'western',
  // States/Provinces (general mentions without specific address)
  'california', 'texas', 'florida', 'new york', 'london', 'paris', 'tokyo', 'sydney',
  'melbourne', 'toronto', 'vancouver', 'berlin', 'amsterdam', 'barcelona', 'madrid',
  'rome', 'milan', 'munich', 'zurich', 'vienna', 'prague', 'dublin', 'edinburgh',
  'mumbai', 'delhi', 'bangalore', 'shanghai', 'beijing', 'hong kong', 'seoul', 'bangkok',
  'los angeles', 'chicago', 'houston', 'phoenix', 'seattle', 'denver', 'boston', 'atlanta',
  'miami', 'dallas', 'san francisco', 'san diego', 'austin', 'las vegas', 'portland',
  // General location words
  'state', 'province', 'region', 'country', 'area', 'zone', 'district', 'county',
  'nearby', 'local', 'around here', 'my area', 'my city', 'my town', 'my country',
]

// Check if message contains blocked address information
// Returns: hasAddress (true = blocked), warning message, isAllowedGeneralLocation
const containsAddressInfo = (content: string): { hasAddress: boolean; warning?: string; isBlocked: boolean } => {
  const lowerContent = content.toLowerCase()
  
  // First check if it's just a general location mention (ALLOWED)
  for (const allowed of ALLOWED_LOCATION_WORDS) {
    if (lowerContent.includes(allowed)) {
      // Check if there's ALSO specific address info with it
      let hasSpecificAddress = false
      for (const pattern of ADDRESS_PATTERNS) {
        // Reset lastIndex for regex
        pattern.lastIndex = 0
        if (pattern.test(content)) {
          hasSpecificAddress = true
          break
        }
      }
      
      if (!hasSpecificAddress) {
        // Just general location - ALLOW
        return { hasAddress: false, isBlocked: false }
      }
    }
  }
  
  // Check for blocked patterns
  for (const pattern of ADDRESS_PATTERNS) {
    // Reset lastIndex for regex
    pattern.lastIndex = 0
    if (pattern.test(content)) {
      return {
        hasAddress: true,
        isBlocked: true,
        warning: '🚫 BLOCKED: For your safety, sharing specific addresses, phone numbers, or exact locations is not allowed. You can share general location like country, state, or region only.'
      }
    }
  }
  
  return { hasAddress: false, isBlocked: false }
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
  roomId,
  reactions: []
})

// Store messages in memory (for reactions)
const messageStore = new Map<string, Message>()

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
    
    // Check for address information in text content - BLOCK if found
    const addressCheck = containsAddressInfo(content)
    if (addressCheck.isBlocked) {
      console.log(`[BLOCKED] ${user.username} tried to share address info: ${content.substring(0, 50)}...`)
      socket.emit('message-blocked', { 
        reason: addressCheck.warning,
        originalContent: content
      })
      return // DO NOT send the message
    }
    
    const message: Message = {
      id: generateMessageId(),
      from: user.username,
      content,
      timestamp: new Date(),
      type: 'public',
      roomId: user.roomId,
      file,
      reactions: []
    }
    
    // Store message for reactions
    messageStore.set(message.id, message)
    
    console.log(`[Message] ${user.username} in room ${user.roomId}: ${content}${file ? ` [File: ${file.name}]` : ''}`)
    
    // Broadcast to everyone in the room including sender
    io.to(user.roomId).emit('message', message)
  })

  // Add reaction to message
  socket.on('add-reaction', (data: { messageId: string; emoji: string }) => {
    const user = users.get(socket.id)
    if (!user) return
    
    const message = messageStore.get(data.messageId)
    if (!message) {
      socket.emit('error', { message: 'Message not found' })
      return
    }
    
    // Check if user already reacted with this emoji
    let reaction = message.reactions.find(r => r.emoji === data.emoji)
    
    if (reaction) {
      // Toggle reaction (remove if exists, add if not)
      const userIndex = reaction.userIds.indexOf(socket.id)
      if (userIndex > -1) {
        reaction.userIds.splice(userIndex, 1)
        // Remove reaction entirely if no users left
        if (reaction.userIds.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== data.emoji)
        }
      } else {
        reaction.userIds.push(socket.id)
      }
    } else {
      // Add new reaction
      message.reactions.push({
        emoji: data.emoji,
        userIds: [socket.id]
      })
    }
    
    // Broadcast updated message to room
    io.to(user.roomId).emit('message-reaction', {
      messageId: message.id,
      reactions: message.reactions,
      reactedBy: user.username
    })
  })

  // Edit message
  socket.on('edit-message', (data: { messageId: string; newContent: string }) => {
    const user = users.get(socket.id)
    if (!user) return
    
    const message = messageStore.get(data.messageId)
    if (!message) {
      socket.emit('error', { message: 'Message not found' })
      return
    }
    
    // Only allow editing own messages
    if (message.from !== user.username) {
      socket.emit('error', { message: 'You can only edit your own messages' })
      return
    }
    
    // Check for address in new content
    const addressCheck = containsAddressInfo(data.newContent)
    if (addressCheck.isBlocked) {
      socket.emit('message-blocked', { 
        reason: addressCheck.warning,
        originalContent: data.newContent
      })
      return
    }
    
    // Update message
    message.content = data.newContent
    message.edited = true
    message.editedAt = new Date()
    
    console.log(`[Edit] ${user.username} edited message ${data.messageId}`)
    
    // Broadcast edited message
    io.to(user.roomId).emit('message-edited', {
      messageId: message.id,
      content: message.content,
      edited: true,
      editedAt: message.editedAt
    })
  })

  // Delete message
  socket.on('delete-message', (data: { messageId: string }) => {
    const user = users.get(socket.id)
    if (!user) return
    
    const message = messageStore.get(data.messageId)
    if (!message) {
      socket.emit('error', { message: 'Message not found' })
      return
    }
    
    // Only allow deleting own messages
    if (message.from !== user.username) {
      socket.emit('error', { message: 'You can only delete your own messages' })
      return
    }
    
    // Mark as deleted instead of removing
    message.deleted = true
    message.content = 'This message was deleted'
    
    console.log(`[Delete] ${user.username} deleted message ${data.messageId}`)
    
    // Broadcast deleted message
    io.to(user.roomId).emit('message-deleted', {
      messageId: message.id
    })
  })

  // === WEBRTC SIGNALING ===
  
  // Start a voice call
  socket.on('start-call', (data: { toUserId: string; callId: string }) => {
    const caller = users.get(socket.id)
    if (!caller) return
    
    const recipient = users.get(data.toUserId)
    if (!recipient) {
      socket.emit('error', { message: 'User not found' })
      return
    }
    
    console.log(`[Call] ${caller.username} is calling ${recipient.username}`)
    
    // Notify recipient
    io.to(data.toUserId).emit('incoming-call', {
      from: { id: socket.id, username: caller.username },
      callId: data.callId
    })
  })

  // Accept a call
  socket.on('accept-call', (data: { toUserId: string; callId: string }) => {
    const accepter = users.get(socket.id)
    if (!accepter) return
    
    console.log(`[Call] ${accepter.username} accepted the call`)
    
    // Notify caller
    io.to(data.toUserId).emit('call-accepted', {
      from: { id: socket.id, username: accepter.username },
      callId: data.callId
    })
  })

  // Reject a call
  socket.on('reject-call', (data: { toUserId: string }) => {
    const rejecter = users.get(socket.id)
    if (!rejecter) return
    
    console.log(`[Call] ${rejecter.username} rejected the call`)
    
    // Notify caller
    io.to(data.toUserId).emit('call-rejected', {
      from: { id: socket.id, username: rejecter.username }
    })
  })

  // End a call
  socket.on('end-call', (data: { toUserId: string }) => {
    const user = users.get(socket.id)
    if (!user) return
    
    console.log(`[Call] ${user.username} ended the call`)
    
    // Notify other party
    io.to(data.toUserId).emit('call-ended')
  })

  // WebRTC Offer
  socket.on('webrtc-offer', (data: { toUserId: string; offer: RTCSessionDescriptionInit }) => {
    const user = users.get(socket.id)
    if (!user) return
    
    io.to(data.toUserId).emit('webrtc-offer', {
      from: { id: socket.id, username: user.username },
      offer: data.offer
    })
  })

  // WebRTC Answer
  socket.on('webrtc-answer', (data: { toUserId: string; answer: RTCSessionDescriptionInit }) => {
    io.to(data.toUserId).emit('webrtc-answer', {
      answer: data.answer
    })
  })

  // ICE Candidate
  socket.on('webrtc-ice-candidate', (data: { toUserId: string; candidate: RTCIceCandidateInit }) => {
    io.to(data.toUserId).emit('webrtc-ice-candidate', {
      candidate: data.candidate
    })
  })

  // Start screen share
  socket.on('start-screen-share', () => {
    const user = users.get(socket.id)
    if (!user) return
    
    console.log(`[ScreenShare] ${user.username} started sharing screen`)
    
    // Notify everyone in the room
    socket.to(user.roomId).emit('screen-share-started', {
      userId: socket.id,
      username: user.username
    })
  })

  // Stop screen share
  socket.on('stop-screen-share', () => {
    const user = users.get(socket.id)
    if (!user) return
    
    console.log(`[ScreenShare] ${user.username} stopped sharing screen`)
    
    // Notify everyone in the room
    io.to(user.roomId).emit('screen-share-ended')
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
    
    // Check for address information - BLOCK if found
    const addressCheck = containsAddressInfo(content)
    if (addressCheck.isBlocked) {
      console.log(`[BLOCKED] ${sender.username} tried to share address info in private: ${content.substring(0, 50)}...`)
      socket.emit('message-blocked', { 
        reason: addressCheck.warning,
        originalContent: content
      })
      return // DO NOT send the message
    }
    
    const message: Message = {
      id: generateMessageId(),
      from: sender.username,
      to: recipient.username,
      content,
      timestamp: new Date(),
      type: 'private',
      roomId: sender.roomId,
      file,
      reactions: []
    }
    
    // Store message for reactions
    messageStore.set(message.id, message)
    
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
