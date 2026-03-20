# 💬 WebSocket Chat

A modern, real-time peer-to-peer chat application built with **Next.js 16**, **Socket.io**, and **TypeScript**. Create chat rooms instantly and share codes with friends to start messaging!

![WebSocket Chat](https://img.shields.io/badge/WebSocket-Real--time-emerald?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Socket.io](https://img.shields.io/badge/Socket.io-4-white?style=for-the-badge&logo=socket.io)

---

## ✨ Features

### 🏠 Room Management
| Feature | Description |
|---------|-------------|
| **Create Rooms** | Host a WebSocket chat room with a single click. A unique 6-character room code is generated automatically (e.g., `A3K7XM`) |
| **Join Rooms** | Enter a friend's room code to instantly join their chat room |
| **Host Badge** | Room creators are marked with a crown badge (👑) for easy identification |
| **Host Transfer** | If the host leaves, host privileges are automatically transferred to another user |

### 💬 Messaging
| Feature | Description |
|---------|-------------|
| **Real-time Chat** | Messages are delivered instantly to all users in the room via WebSocket |
| **Private Messages** | Click on any user in the sidebar to send them a private message (shown in purple) |
| **Typing Indicators** | See when other users are typing with real-time indicators |
| **System Messages** | Automatic notifications when users join or leave the room |
| **Message Timestamps** | Each message shows the time it was sent |

### 🎨 User Interface
| Feature | Description |
|---------|-------------|
| **Dark Theme** | Beautiful dark theme with emerald/teal gradient accents |
| **Responsive Design** | Fully responsive - works great on desktop and mobile devices |
| **User List Sidebar** | See all users in the room with their avatars |
| **Connection Status** | Visual indicator showing WebSocket connection state |
| **Copy Room Code** | One-click copy button for sharing room codes |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type-safe JavaScript |
| **Socket.io** | Real-time bidirectional communication |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **shadcn/ui** | Beautiful, accessible UI components |
| **Bun** | Fast JavaScript runtime |

---

## 📸 Screenshots

### Landing Page
The entry point where users can create or join rooms.

![Landing Page](https://via.placeholder.com/800x400/1e293b/10b981?text=Enter+Username+and+Host/Join)

### Chat Room
Real-time messaging with user list sidebar.

![Chat Room](https://via.placeholder.com/800x500/1e293b/10b981?text=Chat+Room+with+Messages)

---

## 🚀 Quick Start

### Option 1: Use the Live Demo
Visit the deployed application and start chatting immediately!

### Option 2: Run Locally
See the [How to Run Locally](#-how-to-run-locally) section below.

---

## 📖 How to Use

### Hosting a Room
1. Enter your username on the landing page
2. Click the **"Host WebSocket Chat"** button
3. A unique 6-character room code will be generated
4. Share this code with your friends
5. Start chatting!

### Joining a Room
1. Enter your username on the landing page
2. Enter the room code shared by your friend in the input field
3. Click **"Join Room"**
4. Start chatting!

### Sending Private Messages
1. In the chat room, look at the **Users** sidebar on the right
2. Click on the user you want to message privately
3. A purple banner will appear indicating private message mode
4. Type your message and send - only that user will see it

### Copying Room Code
- Click the copy button (📋) next to the room code in the header
- The code is copied to your clipboard for easy sharing

---

## 🤝 Contributing

We welcome contributions! Please see our [**Contributing Guide**](./CONTRIBUTING.md) for details on:

- 🐛 Reporting bugs
- 💡 Suggesting features
- 🔧 Submitting pull requests
- 📝 Code style guidelines

---

## 📁 Project Structure

```
websocket-chat/
├── 📁 src/
│   └── 📁 app/
│       ├── page.tsx          # Main chat component (UI + logic)
│       ├── layout.tsx        # Root layout with metadata
│       └── globals.css       # Global styles
├── 📁 mini-services/
│   └── 📁 chat-server/
│       ├── index.ts          # Socket.io WebSocket server
│       └── package.json      # Server dependencies
├── 📁 src/components/ui/     # shadcn/ui components
├── 📁 src/hooks/             # Custom React hooks
├── 📁 prisma/                # Database schema (optional)
├── package.json              # Main dependencies
├── tailwind.config.ts        # Tailwind configuration
└── README.md                 # This file
```

---

## 🔧 Environment Variables

No environment variables are required for basic usage. The app uses local WebSocket connections.

---

## 📋 API Reference

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `create-room` | `{ username: string }` | Create a new chat room |
| `join-room` | `{ username: string, roomCode: string }` | Join an existing room |
| `send-message` | `{ content: string }` | Send a message to the room |
| `send-private-message` | `{ toUserId: string, content: string }` | Send a private message |
| `typing` | - | Emit when user starts typing |
| `stop-typing` | - | Emit when user stops typing |
| `leave-room` | - | Leave the current room |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `room-created` | `{ roomCode, roomId, isHost }` | Room creation confirmation |
| `room-joined` | `{ roomId, roomCode, isHost }` | Room join confirmation |
| `message` | `Message` | New public message |
| `private-message` | `{ message, fromUserId, fromUsername }` | Private message received |
| `users-update` | `{ users: User[] }` | Updated user list |
| `user-joined` | `{ user }` | User joined notification |
| `user-left` | `{ userId, username }` | User left notification |
| `user-typing` | `{ username }` | User is typing |
| `user-stop-typing` | `{ username }` | User stopped typing |
| `error` | `{ message }` | Error notification |

---

## 🐛 Known Issues

- None at the moment! Report any issues in our [Issues](https://github.com/TheStrongestOfTomorrow/websocket-chat/issues) page.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Socket.io](https://socket.io/) for the reliable WebSocket implementation
- [Next.js](https://nextjs.org/) for the amazing React framework

---

## 💻 How to Run Locally

Want to run this project on your own machine? Follow these steps:

### Prerequisites

Make sure you have one of the following installed:
- **Node.js** (v18 or higher) + npm/yarn/pnpm
- **Bun** (recommended for faster performance)

### Step 1: Clone the Repository

```bash
git clone https://github.com/TheStrongestOfTomorrow/websocket-chat.git
cd websocket-chat
```

### Step 2: Install Dependencies

Using **Bun** (recommended):
```bash
bun install
```

Using **npm**:
```bash
npm install
```

Using **yarn**:
```bash
yarn install
```

### Step 3: Start the WebSocket Server

Open a terminal and run:

Using **Bun**:
```bash
cd mini-services/chat-server
bun install
bun run dev
```

Using **npm**:
```bash
cd mini-services/chat-server
npm install
npm run dev
```

You should see:
```
[Server] WebSocket Chat Server running on port 3003
[Server] Ready for connections!
```

### Step 4: Start the Next.js App

Open a **new terminal** and run:

Using **Bun**:
```bash
bun run dev
```

Using **npm**:
```bash
npm run dev
```

### Step 5: Open in Browser

Open your browser and navigate to:
```
http://localhost:3000
```

### Step 6: Test with Multiple Users

To test the chat functionality:

1. Open `http://localhost:3000` in **Browser Tab 1**
2. Enter username: `Alice`
3. Click "Host WebSocket Chat"
4. Note the room code (e.g., `A3K7XM`)

5. Open `http://localhost:3000` in **Browser Tab 2** (incognito/private mode recommended)
6. Enter username: `Bob`
7. Enter the room code from step 4
8. Click "Join Room"

9. Both users can now chat in real-time! 🎉

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection Error" toast | Make sure the WebSocket server (step 3) is running on port 3003 |
| "Connecting..." spinner stays | Check if port 3003 is blocked by firewall |
| Page doesn't load | Verify Next.js server is running on port 3000 |
| Messages not sending | Check browser console for errors, ensure both servers are running |

### Port Configuration

By default:
- **Next.js App**: Port `3000`
- **WebSocket Server**: Port `3003`

To change ports, update the relevant files:
- Next.js: Modify the `dev` script in `package.json`
- WebSocket: Change `PORT` constant in `mini-services/chat-server/index.ts`

---

<div align="center">

**Made with ❤️ using Next.js and Socket.io**

[⬆ Back to Top](#-websocket-chat)

</div>
