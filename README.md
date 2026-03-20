# WebSocket Chat 💬

A real-time peer-to-peer chat application built with Next.js, Socket.io, and TypeScript.

![WebSocket Chat](https://img.shields.io/badge/WebSocket-Chat-emerald?style=for-the-badge)

## Features ✨

- **Host WebSocket Chat**: Create a chat room with a unique 6-character code
- **Join Rooms**: Enter a room code to join your friends
- **Real-time Messaging**: Instant message delivery via WebSocket
- **Private Messages**: Send private messages to specific users
- **Typing Indicators**: See when others are typing
- **Host Transfer**: Automatic host transfer when host leaves
- **Responsive Design**: Works on desktop and mobile

## Tech Stack 🛠️

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Real-time Communication**: Socket.io
- **Runtime**: Bun

## Getting Started 🚀

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/websocket-chat.git
cd websocket-chat
```

2. Install dependencies:
```bash
bun install
```

3. Start the WebSocket server:
```bash
cd mini-services/chat-server && bun run dev
```

4. In a new terminal, start the Next.js app:
```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use 📖

### Hosting a Chat Room

1. Enter your username
2. Click "Host WebSocket Chat"
3. Share the generated room code with your friends
4. Start chatting!

### Joining a Chat Room

1. Enter your username
2. Enter the room code shared by your friend
3. Click "Join Room"
4. Start chatting!

### Private Messaging

1. Click on a user in the sidebar
2. Type your message
3. The message will be sent privately to that user

## Project Structure 📁

```
websocket-chat/
├── src/
│   └── app/
│       ├── page.tsx          # Main chat component
│       ├── layout.tsx        # Root layout
│       └── globals.css       # Global styles
├── mini-services/
│   └── chat-server/
│       └── index.ts          # WebSocket server
├── components.json           # shadcn/ui config
├── tailwind.config.ts        # Tailwind config
└── package.json
```

## License 📄

MIT License

---

Made with ❤️ using Next.js and Socket.io
