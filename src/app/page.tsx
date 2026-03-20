'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  MessageCircle, 
  Users, 
  Send, 
  Copy, 
  Check, 
  Wifi, 
  WifiOff,
  UserPlus,
  LogOut,
  Crown,
  Loader2,
  Hash,
  Smile,
  X,
  Clock,
  Trash2,
  MessageSquare,
  User,
  Paperclip,
  File,
  Image,
  Download,
  Settings,
  MapPin,
  Shield,
  AlertTriangle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  username: string
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
  timestamp: Date | string
  type: 'public' | 'private' | 'system'
  roomId: string
  file?: FileAttachment
}

interface SavedRoom {
  code: string
  lastUsed: string
  hostName?: string
}

interface UserSettings {
  profanityFilter: boolean
  showLocation: boolean
}

type AppView = 'landing' | 'chat'

// Profanity filter words list
const PROFANITY_WORDS = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'hell', 'bastard',
  'dick', 'piss', 'cock', 'pussy', 'whore', 'slut', 'fag', 'nigga', 'nigger',
  'wanker', 'twat', 'cunt', 'bollocks', 'bloody', 'bugger'
]

// Emoji categories for the picker
const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮', '🤯', '😱', '🥵', '🥶', '😳', '🤡', '👻', '👽', '🤖'],
  'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '💪', '🦾'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'],
  'Objects': ['🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🎮', '🎲', '🎵', '🎶', '🎸', '🎹', '📱', '💻', '⌨️', '🖥️', '📷', '🔥', '⭐', '🌟', '✨', '💫', '💡', '💎', '🔑', '🔔'],
  'Food': ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🍳', '🧇', '🥞', '🧈', '🍞', '🥐', '🥨', '🧀', '🥗', '🥙', '🥪', '🌮', '🌯', '🍜', '🍝', '🍣', '🍱', '🥟', '🍦', '🍧', '🍩', '🍪', '🎂', '🍰', '🧁', '🍫', '🍬', '🍭', '☕', '🍵', '🥤', '🍺', '🍻', '🍷', '🥂'],
  'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🦋', '🐌', '🐛', '🦀', '🦞', '🦐', '🐙', '🦑', '🐠', '🐟', '🐡', '🐬', '🦈', '🐊', '🐢', '🦎', '🐍', '🐉', '🦕', '🦖']
}

const ALL_EMOJIS = Object.values(EMOJI_CATEGORIES).flat()

// Local storage keys
const SAVED_ROOMS_KEY = 'websocket-chat-saved-rooms'
const LAST_USERNAME_KEY = 'websocket-chat-last-username'
const USER_SETTINGS_KEY = 'websocket-chat-user-settings'

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Helper function to load from localStorage (used for lazy initialization)
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

// Filter profanity from text
const filterProfanity = (text: string): string => {
  let filtered = text
  PROFANITY_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    filtered = filtered.replace(regex, '****')
  })
  return filtered
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Get file icon based on type
const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image
  return File
}

export default function WebSocketChat() {
  const [view, setView] = useState<AppView>('landing')
  const [username, setUsername] = useState(() => loadFromLocalStorage(LAST_USERNAME_KEY, ''))
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [selectedPrivateUser, setSelectedPrivateUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>(() => loadFromLocalStorage(SAVED_ROOMS_KEY, []))
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiCategory, setEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Smileys')
  const [settings, setSettings] = useState<UserSettings>(() => loadFromLocalStorage(USER_SETTINGS_KEY, {
    profanityFilter: true,
    showLocation: false
  }))
  const [showSettings, setShowSettings] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  // Save room code to localStorage
  const saveRoomCode = useCallback((code: string, hostName?: string) => {
    try {
      const existing = savedRooms.filter(r => r.code !== code)
      const newRoom: SavedRoom = {
        code,
        lastUsed: new Date().toISOString(),
        hostName
      }
      const updated = [newRoom, ...existing].slice(0, 10)
      setSavedRooms(updated)
      localStorage.setItem(SAVED_ROOMS_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save room code:', e)
    }
  }, [savedRooms])

  // Delete a saved room code
  const deleteSavedRoom = useCallback((code: string) => {
    try {
      const updated = savedRooms.filter(r => r.code !== code)
      setSavedRooms(updated)
      localStorage.setItem(SAVED_ROOMS_KEY, JSON.stringify(updated))
      toast({
        title: 'Code Removed',
        description: `Room code ${code} has been removed from your saved codes.`
      })
    } catch (e) {
      console.error('Failed to delete room code:', e)
    }
  }, [savedRooms, toast])

  // Save username to localStorage
  useEffect(() => {
    if (username.trim()) {
      localStorage.setItem(LAST_USERNAME_KEY, username.trim())
    }
  }, [username])

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File Too Large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive'
      })
      return
    }

    setSelectedFile(file)
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }, [toast])

  // Clear selected file
  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 15000
    })

    socketRef.current = socketInstance

    socketInstance.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to WebSocket server')
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from WebSocket server')
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error)
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the chat server. Please try again.',
        variant: 'destructive'
      })
    })

    socketInstance.on('room-created', (data: { roomCode: string; roomId: string; isHost: boolean }) => {
      setRoomCode(data.roomCode)
      setIsHost(true)
      setView('chat')
      setIsLoading(false)
      saveRoomCode(data.roomCode, username)
      toast({
        title: 'Room Created! 🎉',
        description: `Your room code is: ${data.roomCode}`
      })
    })

    socketInstance.on('room-joined', (data: { roomId: string; roomCode: string; isHost: boolean }) => {
      setRoomCode(data.roomCode)
      setIsHost(data.isHost)
      setView('chat')
      setIsLoading(false)
      saveRoomCode(data.roomCode)
      toast({
        title: 'Joined Room! 🎉',
        description: `You've joined room: ${data.roomCode}`
      })
    })

    socketInstance.on('message', (msg: Message) => {
      setMessages(prev => [...prev, msg])
    })

    socketInstance.on('private-message', (data: { message: Message; fromUserId: string; fromUsername: string; toUsername?: string }) => {
      setMessages(prev => [...prev, data.message])
      
      if (data.fromUserId !== socketInstance.id) {
        toast({
          title: `🔒 Private message from ${data.fromUsername}`,
          description: data.message.content.substring(0, 50) + (data.message.content.length > 50 ? '...' : '')
        })
      }
    })

    socketInstance.on('user-joined', (data: { user: User }) => {
      toast({
        title: 'User Joined 👋',
        description: `${data.user.username} joined the chat`
      })
    })

    socketInstance.on('user-left', (data: { userId: string; username: string }) => {
      setUsers(prev => prev.filter(u => u.id !== data.userId))
      toast({
        title: 'User Left',
        description: `${data.username} left the chat`
      })
    })

    socketInstance.on('users-update', (data: { users: User[] }) => {
      setUsers(data.users)
    })

    socketInstance.on('user-typing', (data: { username: string }) => {
      setTypingUsers(prev => new Set(prev).add(data.username))
    })

    socketInstance.on('user-stop-typing', (data: { username: string }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(data.username)
        return newSet
      })
    })

    socketInstance.on('host-transferred', () => {
      setIsHost(true)
      toast({
        title: 'You are now the host 👑',
        description: 'The previous host left and you are now the room host.'
      })
    })

    socketInstance.on('error', (data: { message: string }) => {
      setIsLoading(false)
      toast({
        title: 'Error',
        description: data.message,
        variant: 'destructive'
      })
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [toast, saveRoomCode, username])

  // Host a new room
  const handleCreateRoom = useCallback(() => {
    if (!username.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter a username to create a room.',
        variant: 'destructive'
      })
      return
    }
    if (!socketRef.current || !isConnected) {
      toast({
        title: 'Not Connected',
        description: 'Please wait for the connection to establish.',
        variant: 'destructive'
      })
      return
    }
    setIsLoading(true)
    socketRef.current.emit('create-room', { username: username.trim() })
  }, [username, isConnected, toast])

  // Join an existing room
  const handleJoinRoom = useCallback((code?: string) => {
    const codeToUse = code || joinCode
    if (!username.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter a username to join a room.',
        variant: 'destructive'
      })
      return
    }
    if (!codeToUse.trim()) {
      toast({
        title: 'Room Code Required',
        description: 'Please enter a room code to join.',
        variant: 'destructive'
      })
      return
    }
    if (!socketRef.current || !isConnected) {
      toast({
        title: 'Not Connected',
        description: 'Please wait for the connection to establish.',
        variant: 'destructive'
      })
      return
    }
    setIsLoading(true)
    socketRef.current.emit('join-room', { username: username.trim(), roomCode: codeToUse.trim().toUpperCase() })
  }, [username, joinCode, isConnected, toast])

  // Handle stop typing
  const handleStopTyping = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('stop-typing')
    }
  }, [])

  // Handle typing indicators
  const handleTyping = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing')
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        handleStopTyping()
      }, 2000)
    }
  }, [isConnected, handleStopTyping])

  // Send message
  const sendMessage = useCallback(async () => {
    if ((!inputMessage.trim() && !selectedFile) || !socketRef.current) return
    
    // Apply profanity filter if enabled
    let content = inputMessage.trim()
    if (settings.profanityFilter) {
      content = filterProfanity(content)
    }

    // Handle file attachment
    let fileAttachment: FileAttachment | undefined
    if (selectedFile) {
      const base64 = await fileToBase64(selectedFile)
      fileAttachment = {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        data: base64
      }
    }
    
    if (selectedPrivateUser) {
      socketRef.current.emit('send-private-message', {
        toUserId: selectedPrivateUser.id,
        content,
        file: fileAttachment
      })
    } else {
      socketRef.current.emit('send-message', { content, file: fileAttachment })
    }
    
    setInputMessage('')
    clearSelectedFile()
    handleStopTyping()
    inputRef.current?.focus()
  }, [inputMessage, selectedPrivateUser, handleStopTyping, settings.profanityFilter, selectedFile, clearSelectedFile])

  // Insert emoji into message
  const insertEmoji = useCallback((emoji: string) => {
    setInputMessage(prev => prev + emoji)
    inputRef.current?.focus()
  }, [])

  // Copy room code to clipboard
  const copyRoomCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: 'Copied! 📋',
        description: 'Room code copied to clipboard'
      })
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy room code',
        variant: 'destructive'
      })
    }
  }, [roomCode, toast])

  // Leave room
  const handleLeaveRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room')
    }
    setView('landing')
    setMessages([])
    setUsers([])
    setRoomCode('')
    setIsHost(false)
    setSelectedPrivateUser(null)
    setJoinCode('')
    clearSelectedFile()
  }, [clearSelectedFile])

  // Format timestamp
  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Format date for saved rooms
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  // Download file
  const downloadFile = useCallback((file: FileAttachment) => {
    const link = document.createElement('a')
    link.href = file.data
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  // Landing Page
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDI0MmEiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzBoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWOGgydjh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="w-full max-w-lg relative z-10 space-y-4">
          <Card className="backdrop-blur-sm bg-slate-800/90 border-slate-700 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-2">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">WebSocket Chat 💬</CardTitle>
                <CardDescription className="text-slate-400 mt-2">
                  Create or join a chat room with friends
                </CardDescription>
              </div>
              <div className="flex items-center justify-center gap-2">
                {isConnected ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    <Wifi className="w-3 h-3 mr-1" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Connecting...
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Your Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username..."
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && username.trim()) {
                      handleCreateRoom()
                    }
                  }}
                />
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleCreateRoom}
                  disabled={!isConnected || !username.trim() || isLoading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 transition-all duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Wifi className="w-5 h-5 mr-2" />
                  )}
                  Host WebSocket Chat
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full bg-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-800 px-2 text-slate-500">or</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter room code..."
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 text-center font-mono text-lg tracking-widest"
                    maxLength={6}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && username.trim() && joinCode.trim()) {
                        handleJoinRoom()
                      }
                    }}
                  />
                  <Button
                    onClick={() => handleJoinRoom()}
                    disabled={!isConnected || !username.trim() || !joinCode.trim() || isLoading}
                    variant="outline"
                    className="w-full h-11 font-semibold border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-5 h-5 mr-2" />
                    )}
                    Join Room
                  </Button>
                </div>
              </div>

              {/* Settings Link */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="text-slate-400 hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Room Codes */}
          {savedRooms.length > 0 && (
            <Card className="backdrop-blur-sm bg-slate-800/90 border-slate-700 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Saved Room Codes
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Quick access to your previous rooms
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-48">
                  <div className="space-y-1 p-3">
                    {savedRooms.map((room) => (
                      <div
                        key={room.code}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group"
                      >
                        <button
                          onClick={() => {
                            if (username.trim()) {
                              handleJoinRoom(room.code)
                            } else {
                              setJoinCode(room.code)
                              toast({
                                title: 'Enter Username',
                                description: 'Please enter your username first.',
                                variant: 'destructive'
                              })
                            }
                          }}
                          className="flex items-center gap-3 flex-1 text-left"
                          disabled={isLoading}
                        >
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Hash className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <code className="text-emerald-400 font-mono font-bold text-lg">{room.code}</code>
                            <p className="text-xs text-slate-500">
                              {formatDate(room.lastUsed)}
                              {room.hostName && ` • Host: ${room.hostName}`}
                            </p>
                          </div>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSavedRoom(room.code)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" /> Settings
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Customize your chat experience
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Profanity Filter
                  </Label>
                  <p className="text-xs text-slate-400">
                    Filter inappropriate language (ON by default)
                  </p>
                </div>
                <Switch
                  checked={settings.profanityFilter}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, profanityFilter: checked }))}
                />
              </div>
              
              <Separator className="bg-slate-700" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Show General Location
                  </Label>
                  <p className="text-xs text-slate-400">
                    Show country/region only (no addresses)
                  </p>
                </div>
                <Switch
                  checked={settings.showLocation}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showLocation: checked }))}
                />
              </div>

              {settings.profanityFilter && (
                <>
                  <Separator className="bg-slate-700" />
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-300">
                      Profanity filter is ON. Inappropriate words will be replaced with ****
                    </p>
                  </div>
                </>
              )}

              {!settings.profanityFilter && (
                <>
                  <Separator className="bg-slate-700" />
                  <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="text-xs text-amber-300">
                      Profanity filter is OFF. You may see unfiltered content.
                    </p>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Chat View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white">WebSocket Chat</h1>
                  {isHost && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                      <Crown className="w-3 h-3 mr-1" /> Host
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="w-3 h-3 text-slate-500" />
                  <code className="text-emerald-400 font-mono font-bold">{roomCode}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-white"
                    onClick={copyRoomCode}
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {settings.profanityFilter && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs hidden sm:flex">
                  <Shield className="w-3 h-3 mr-1" /> Filter ON
                </Badge>
              )}
              {isConnected ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  <Wifi className="w-3 h-3 mr-1" /> Online
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                  <WifiOff className="w-3 h-3 mr-1" /> Offline
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="text-slate-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeaveRoom}
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <LogOut className="w-4 h-4 mr-2" /> Leave
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto flex gap-4 p-4 min-h-0">
        {/* Users Sidebar */}
        <Card className="w-64 bg-slate-800/90 border-slate-700 backdrop-blur-sm hidden md:flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Session Users ({users.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Click a user for private chat
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-2">
                {/* Everyone (Group Chat) */}
                <div
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer ${
                    selectedPrivateUser === null ? 'bg-emerald-500/20 border border-emerald-500/30' : 'hover:bg-slate-700/50'
                  }`}
                  onClick={() => setSelectedPrivateUser(null)}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      Everyone
                    </p>
                    <p className="text-xs text-slate-400">Group Chat</p>
                  </div>
                </div>
                
                <Separator className="my-2 bg-slate-700" />
                
                {/* Users */}
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer ${
                      selectedPrivateUser?.id === user.id ? 'bg-purple-500/20 border border-purple-500/30' : 'hover:bg-slate-700/50'
                    } ${user.username === username ? 'bg-slate-700/30' : ''}`}
                    onClick={() => {
                      if (user.username !== username) {
                        setSelectedPrivateUser(user)
                      }
                    }}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={`text-xs font-semibold ${
                        user.username === username 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-600 text-slate-200'
                      }`}>
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.username}
                        {user.username === username && ' (you)'}
                      </p>
                      <div className="flex items-center gap-1">
                        {user.username === username && isHost && (
                          <Badge className="bg-amber-500/20 text-amber-400 text-[10px] px-1 py-0">
                            <Crown className="w-2 h-2 mr-0.5" /> Host
                          </Badge>
                        )}
                        {user.username !== username && (
                          <span className="text-xs text-purple-400">🔒 Private</span>
                        )}
                      </div>
                    </div>
                    {user.username !== username && (
                      <User className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="flex-1 flex flex-col bg-slate-800/90 border-slate-700 backdrop-blur-sm">
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Chat mode indicator */}
            <div className={`px-4 py-2 flex items-center justify-between ${
              selectedPrivateUser ? 'bg-purple-500/10 border-b border-purple-500/20' : 'bg-emerald-500/10 border-b border-emerald-500/20'
            }`}>
              <span className={`text-sm font-medium ${selectedPrivateUser ? 'text-purple-300' : 'text-emerald-300'}`}>
                {selectedPrivateUser ? (
                  <>
                    🔒 Private chat with <strong>{selectedPrivateUser.username}</strong>
                  </>
                ) : (
                  <>
                    💬 Group Chat - Everyone can see messages
                  </>
                )}
              </span>
              {selectedPrivateUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPrivateUser(null)}
                  className="text-purple-300 hover:text-white h-7"
                >
                  <X className="w-4 h-4 mr-1" /> Back to Group
                </Button>
              )}
            </div>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation! 🎉</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.type === 'system' 
                          ? 'items-center' 
                          : msg.type === 'private'
                            ? 'items-start'
                            : 'items-start'
                      }`}
                    >
                      {msg.type === 'system' ? (
                        <div className="bg-slate-700/50 px-4 py-2 rounded-full text-sm text-slate-400 italic">
                          {msg.content}
                        </div>
                      ) : msg.type === 'private' ? (
                        <div className={`max-w-[80%] ${msg.from === username ? 'ml-auto' : ''}`}>
                          <div className={`px-3 py-2 rounded-2xl ${
                            msg.from === username 
                              ? 'bg-purple-600 text-white rounded-br-sm' 
                              : 'bg-slate-700 text-white rounded-bl-sm'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium ${msg.from === username ? 'text-purple-200' : 'text-purple-400'}`}>
                                🔒 {msg.from === username ? `To ${msg.to}` : msg.from}
                              </span>
                            </div>
                            <p className="text-sm break-words">{msg.content}</p>
                            {msg.file && (
                              <div className="mt-2 p-2 bg-black/20 rounded-lg">
                                {msg.file.type.startsWith('image/') ? (
                                  <img src={msg.file.data} alt={msg.file.name} className="max-w-full rounded max-h-48" />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <File className="w-8 h-8 text-slate-400" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs truncate">{msg.file.name}</p>
                                      <p className="text-xs text-slate-400">{formatFileSize(msg.file.size)}</p>
                                    </div>
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadFile(msg.file!)}
                                  className="mt-2 w-full text-xs"
                                >
                                  <Download className="w-3 h-3 mr-1" /> Download
                                </Button>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 mt-1 block">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      ) : (
                        <div className={`max-w-[80%] ${msg.from === username ? 'ml-auto' : ''}`}>
                          <div className={`px-4 py-2 rounded-2xl ${
                            msg.from === username 
                              ? 'bg-emerald-600 text-white rounded-br-sm' 
                              : 'bg-slate-700 text-white rounded-bl-sm'
                          }`}>
                            {msg.from !== username && (
                              <span className="text-xs font-medium text-emerald-400 block mb-1">
                                {msg.from}
                              </span>
                            )}
                            <p className="text-sm break-words">{msg.content}</p>
                            {msg.file && (
                              <div className="mt-2 p-2 bg-black/20 rounded-lg">
                                {msg.file.type.startsWith('image/') ? (
                                  <img src={msg.file.data} alt={msg.file.name} className="max-w-full rounded max-h-48" />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <File className="w-8 h-8 text-slate-400" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs truncate">{msg.file.name}</p>
                                      <p className="text-xs text-slate-400">{formatFileSize(msg.file.size)}</p>
                                    </div>
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadFile(msg.file!)}
                                  className="mt-2 w-full text-xs"
                                >
                                  <Download className="w-3 h-3 mr-1" /> Download
                                </Button>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 mt-1 block">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="px-4 py-2 text-sm text-slate-400">
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            {/* File Preview */}
            {selectedFile && (
              <div className="px-4 py-2 border-t border-slate-700 bg-slate-700/30">
                <div className="flex items-center gap-2">
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-600 rounded flex items-center justify-center">
                      <File className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedFile}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Input */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                {/* File Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-slate-400 hover:text-white shrink-0"
                  title="Attach file (max 10MB)"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>

                {/* Emoji Picker */}
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white shrink-0"
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 bg-slate-800 border-slate-700" align="start">
                    <div className="p-2 border-b border-slate-700">
                      <div className="flex gap-1 overflow-x-auto pb-1">
                        {(Object.keys(EMOJI_CATEGORIES) as Array<keyof typeof EMOJI_CATEGORIES>).map((cat) => (
                          <Button
                            key={cat}
                            variant={emojiCategory === cat ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setEmojiCategory(cat)}
                            className={`text-xs shrink-0 ${emojiCategory === cat ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                          >
                            {cat}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <ScrollArea className="h-48">
                      <div className="grid grid-cols-8 gap-1 p-2">
                        {EMOJI_CATEGORIES[emojiCategory].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              insertEmoji(emoji)
                              setShowEmojiPicker(false)
                            }}
                            className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded text-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
                
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value)
                    handleTyping()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder={selectedPrivateUser ? `Message ${selectedPrivateUser.username} privately...` : "Type a message..."}
                  className="flex-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <Button
                  onClick={sendMessage}
                  disabled={(!inputMessage.trim() && !selectedFile) || !isConnected}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Mobile Users Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-20">
        <Button
          variant="default"
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
          onClick={() => {
            setSelectedPrivateUser(null)
          }}
        >
          <Users className="w-5 h-5 mr-2" />
          {users.length}
        </Button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" /> Settings
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Customize your chat experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Profanity Filter
                </Label>
                <p className="text-xs text-slate-400">
                  Filter inappropriate language (ON by default)
                </p>
              </div>
              <Switch
                checked={settings.profanityFilter}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, profanityFilter: checked }))}
              />
            </div>
            
            <Separator className="bg-slate-700" />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Show General Location
                </Label>
                <p className="text-xs text-slate-400">
                  Show country/region only (no addresses)
                </p>
              </div>
              <Switch
                checked={settings.showLocation}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showLocation: checked }))}
              />
            </div>

            {settings.profanityFilter && (
              <>
                <Separator className="bg-slate-700" />
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-300">
                    Profanity filter is ON. Inappropriate words will be replaced with ****
                  </p>
                </div>
              </>
            )}

            {!settings.profanityFilter && (
              <>
                <Separator className="bg-slate-700" />
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-300">
                    Profanity filter is OFF. You may see unfiltered content.
                  </p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
