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
  Hash
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  username: string
}

interface Message {
  id: string
  from: string
  to?: string
  content: string
  timestamp: Date | string
  type: 'public' | 'private' | 'system'
  roomId: string
}

type AppView = 'landing' | 'chat'

export default function WebSocketChat() {
  const [view, setView] = useState<AppView>('landing')
  const [username, setUsername] = useState('')
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const { toast } = useToast()

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

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
      toast({
        title: 'Room Created!',
        description: `Your room code is: ${data.roomCode}`
      })
    })

    socketInstance.on('room-joined', (data: { roomId: string; roomCode: string; isHost: boolean }) => {
      setRoomCode(data.roomCode)
      setIsHost(data.isHost)
      setView('chat')
      setIsLoading(false)
      toast({
        title: 'Joined Room!',
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
          title: `Private message from ${data.fromUsername}`,
          description: data.message.content.substring(0, 50) + (data.message.content.length > 50 ? '...' : '')
        })
      }
    })

    socketInstance.on('user-joined', (data: { user: User }) => {
      toast({
        title: 'User Joined',
        description: `${data.user.username} joined the chat`
      })
    })

    socketInstance.on('user-left', (data: { userId: string; username: string }) => {
      setUsers(prev => prev.filter(u => u.id !== data.userId))
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
        title: 'You are now the host',
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
  }, [toast])

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
  const handleJoinRoom = useCallback(() => {
    if (!username.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter a username to join a room.',
        variant: 'destructive'
      })
      return
    }
    if (!joinCode.trim()) {
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
    socketRef.current.emit('join-room', { username: username.trim(), roomCode: joinCode.trim().toUpperCase() })
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
  const sendMessage = useCallback(() => {
    if (!inputMessage.trim() || !socketRef.current) return
    
    if (selectedPrivateUser) {
      socketRef.current.emit('send-private-message', {
        toUserId: selectedPrivateUser.id,
        content: inputMessage.trim()
      })
    } else {
      socketRef.current.emit('send-message', { content: inputMessage.trim() })
    }
    
    setInputMessage('')
    handleStopTyping()
  }, [inputMessage, selectedPrivateUser, handleStopTyping])

  // Copy room code to clipboard
  const copyRoomCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: 'Copied!',
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
  }, [])

  // Format timestamp
  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Landing Page
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDI0MmEiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzBoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWOGgydjh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <Card className="w-full max-w-md relative backdrop-blur-sm bg-slate-800/90 border-slate-700 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">WebSocket Chat</CardTitle>
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
                />
                <Button
                  onClick={handleJoinRoom}
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
          </CardContent>
        </Card>
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
        {/* Messages Area */}
        <Card className="flex-1 flex flex-col bg-slate-800/90 border-slate-700 backdrop-blur-sm">
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Private message indicator */}
            {selectedPrivateUser && (
              <div className="bg-purple-500/10 border-b border-purple-500/20 px-4 py-2 flex items-center justify-between">
                <span className="text-sm text-purple-300">
                  Messaging <strong>{selectedPrivateUser.username}</strong> privately
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPrivateUser(null)}
                  className="text-purple-300 hover:text-white h-7"
                >
                  Cancel
                </Button>
              </div>
            )}
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
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
                            <p className="text-sm">{msg.content}</p>
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
                            <p className="text-sm">{msg.content}</p>
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
            
            {/* Input */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <Input
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
                  disabled={!inputMessage.trim() || !isConnected}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Sidebar */}
        <Card className="w-64 bg-slate-800/90 border-slate-700 backdrop-blur-sm hidden md:flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer ${
                      selectedPrivateUser?.id === user.id ? 'bg-purple-500/20 border border-purple-500/30' : ''
                    } ${user.username === username ? 'bg-slate-700/30' : ''}`}
                    onClick={() => {
                      if (user.username !== username) {
                        setSelectedPrivateUser(selectedPrivateUser?.id === user.id ? null : user)
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
                      {user.username === username && isHost && (
                        <p className="text-xs text-amber-400">Host</p>
                      )}
                    </div>
                    {user.username !== username && (
                      <MessageCircle className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      {/* Mobile Users Button */}
      <div className="md:hidden fixed bottom-4 right-4">
        <Tabs defaultValue="chat">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="chat" className="data-[state=active]:bg-emerald-600">
              Chat
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-emerald-600 relative">
              <Users className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {users.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
