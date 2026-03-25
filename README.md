# 💬 WebSocket Chat

A modern, real-time peer-to-peer chat application built with **Next.js 16**, **Socket.io**, and **TypeScript**. Create chat rooms instantly and share codes with friends to start messaging!

**🔗 Live Demo: [https://socket-chat.space.z.ai](https://socket-chat.space.z.ai)**

> # 🎉🎂 **BIGGEST UPDATE RELEASED! (March 24, 2026)** 🎂🎉
> ## IT'S MY BIRTHDAY EVE! 🥳
> 
> ### 🚀 **ONE OF THE BIGGEST UPDATES HAS LANDED!**
> 
> **NEW IN THIS UPDATE:**
> - 🎤 **Voice Messages** - Record and send voice clips!
> - 📞 **Voice Calls** - Call other users in the room!
> - 🖥️ **Screen Sharing** - Share your screen with everyone!
> - 🎮 **Minecraft Integration** - Chat from Minecraft Bedrock & Java!
> 
> **COMING TOMORROW (March 25 - MY BIRTHDAY!):**
> - Even MORE surprises! 🎁
> 
> Thanks for the AMAZING support from my YouTube channel! 🙏🔥

![WebSocket Chat](https://img.shields.io/badge/WebSocket-Real--time-emerald?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Socket.io](https://img.shields.io/badge/Socket.io-4-white?style=for-the-badge&logo=socket.io)

### 📱 Platform Support
![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![macOS](https://img.shields.io/badge/macOS-000000?style=for-the-badge&logo=macos&logoColor=white) *(coming soon)*
![iOS](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=ios&logoColor=white) *(coming soon)*

### 🎮 Minecraft Integration
![Minecraft](https://img.shields.io/badge/Minecraft-62B47A?style=for-the-badge&logoColor=white)
![Bedrock](https://img.shields.io/badge/Bedrock-5B5B5B?style=for-the-badge)
![Java](https://img.shields.io/badge/Java_Edition-ED8B00?style=for-the-badge)

Chat with friends directly from Minecraft! Available for both Bedrock and Java Editions.

| Edition | File | Requirements |
|---------|------|--------------|
| **Bedrock** | `.mcaddon` | MC Bedrock 1.19.0+, Enable Beta APIs |
| **Java** | `.jar` | Fabric Loader, Fabric API, MC Java 1.20.4 |

**Note:** Minecraft integration requires a running demo server or self-hosted server. Demo is NOW LIVE! 🚀

---

## 📥 Download Apps

### Desktop Apps (Windows & Linux)
Download the latest release from [GitHub Releases](https://github.com/TheStrongestOfTomorrow/websocket-chat/releases):

| Platform | Format | Notes |
|----------|--------|-------|
| **Windows** | `.exe` (NSIS) | Standalone installer |
| **Windows** | `.msi` | MSI installer for enterprise deployment |
| **Linux (Debian/Ubuntu)** | `.deb` | Debian package |
| **Linux (Fedora/RHEL)** | `.rpm` | RPM package |
| **Linux (Universal)** | `.AppImage` | Portable, no installation required |

### Mobile App (Android)
Download the APK from [GitHub Releases](https://github.com/TheStrongestOfTomorrow/websocket-chat/releases):
- **Android**: `.apk` file - Enable "Install from unknown sources" in settings

### 🎮 Minecraft Addons/Mods
Download from [GitHub Releases](https://github.com/TheStrongestOfTomorrow/websocket-chat/releases):

| Edition | File | How to Install |
|---------|------|----------------|
| **Bedrock** | `.mcaddon` | Double-click or import in-game |
| **Java (Fabric)** | `.jar` | Place in `mods` folder |

### Use Web Version
No download needed! Visit **[https://socket-chat.space.z.ai](https://socket-chat.space.z.ai)** in any modern browser.

---

## ✨ Features

### 🏠 Room Management
| Feature | Description |
|---------|-------------|
| **Create Rooms** | Host a WebSocket chat room with a unique 6-character room code (e.g., `A3K7XM`) |
| **Join Rooms** | Enter a friend's room code to instantly join their chat room |
| **Host Badge** | Room creators are marked with a crown badge (👑) for easy identification |
| **Host Transfer** | If the host leaves, host privileges are automatically transferred to another user |
| **Code Persistence** | Room codes are saved locally! Use your saved codes or enter previous codes like "yesterday's code" without asking the host again |

### 💬 Messaging
| Feature | Description |
|---------|-------------|
| **Real-time Chat** | Messages are delivered instantly to all users in the room via WebSocket |
| **Message Reactions** | React to messages with emojis! Hover over a message to see quick reactions 👍❤️😂😮 |
| **Message Editing** | Edit your sent messages - shows "(edited)" indicator |
| **Message Deletion** | Delete your own messages - shows "This message was deleted" |
| **Voice Messages** | Record and send voice messages! Click the mic button to record 🎤 |
| **Voice Calls** | Make voice calls to other users! Click the phone icon on a user to call 📞 |
| **Screen Sharing** | Share your screen with everyone in the room! Click the monitor icon 🖥️ |
| **File Uploads** | Share any file (images, documents, videos) up to 10MB! Just click the attachment button 📎 |
| **Emoji Support** | Full emoji picker built into the chat! Express yourself with emojis 🎉😊❤️ |
| **Private Messages** | Click on any user in the sidebar to send them a private message (shown in purple) |
| **Group Chats** | When multiple friends join, a group chat is automatically formed. Switch between group chat and private conversations easily |
| **Typing Indicators** | See when other users are typing with real-time indicators |
| **System Messages** | Automatic notifications when users join or leave the room |
| **Message Timestamps** | Each message shows the time it was sent |
| **Image Previews** | Images are displayed inline with click-to-download support |

### 👥 Session & User Management
| Feature | Description |
|---------|-------------|
| **Custom Usernames** | New users can create their own unique username when joining |
| **Session Sidebar** | See all active users in the session with their usernames displayed |
| **Quick Private Chat** | Click any username in the sidebar to start a private conversation |
| **User Avatars** | Colorful avatars with initials for easy identification |
| **Profanity Filter** | Filter inappropriate language (OFF by default). Toggle in Settings to enable |
| **Address Blocking** | For user safety, specific addresses are BLOCKED. Only general location (country/state/region) allowed |

### 📱 Mobile Support
| Feature | Description |
|---------|-------------|
| **Responsive Design** | Fully optimized for mobile screens |
| **Touch-Friendly UI** | Large tap targets and swipe gestures |
| **Mobile Users Drawer** | Slide-out drawer to view users and start private chats |
| **Portrait & Landscape** | Works in both orientations |
| **Native Feel** | PWA-ready for "Add to Home Screen" |

### 🎨 User Interface
| Feature | Description |
|---------|-------------|
| **Dark Theme** | Beautiful dark theme with emerald/teal gradient accents |
| **Responsive Design** | Fully responsive - works great on desktop and mobile devices |
| **User List Sidebar** | See all users in the room with their avatars |
| **Connection Status** | Visual indicator showing WebSocket connection state |
| **Copy Room Code** | One-click copy button for sharing room codes |
| **Saved Codes List** | Quick access to your previously used room codes |
| **Settings Dialog** | Customize profanity filter and other preferences |
| **Filter Status Badge** | Shows if profanity filter is ON/OFF in header |

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
| **Tauri 2** | Cross-platform desktop apps (Windows, Linux, macOS) |
| **Capacitor** | Cross-platform mobile apps (Android, iOS) |

---

## 🚀 Quick Start

### Option 1: Download Native Apps
- **Desktop**: Download from [GitHub Releases](https://github.com/TheStrongestOfTomorrow/websocket-chat/releases)
- **Android**: Download APK from [GitHub Releases](https://github.com/TheStrongestOfTomorrow/websocket-chat/releases)

### Option 2: Use the Live Demo
**🔗 [https://socket-chat.space.z.ai](https://socket-chat.space.z.ai)**

Visit the live demo and start chatting immediately!

### Option 3: Run Locally
See the **[HOSTING.md](./HOSTING.md)** for comprehensive guides on:
- 🖥️ Local development (Bun, npm, Docker, PM2)
- ☁️ Production hosting (Vercel, Railway, DigitalOcean, AWS, Heroku, Render)
- 🔧 Detailed environment configuration
- 🛠️ Troubleshooting common issues
- 🔒 Security considerations

---

## 📖 How to Use

### Hosting a Room
1. Enter your username on the landing page
2. Click the **"Host WebSocket Chat"** button
3. A unique 6-character room code will be generated
4. The code is automatically saved for future use!
5. Share this code with your friends
6. Start chatting!

### Joining a Room
1. Enter your username on the landing page
2. Enter the room code shared by your friend in the input field
3. Click **"Join Room"**
4. The code is saved for easy access next time!
5. Start chatting!

### Using Saved Codes
- Your previously used room codes are saved automatically
- Click on any saved code to quickly join that room again
- No need to ask the host for the code again - use "yesterday's code"!

### Sending Emojis
1. Click the emoji button (😊) in the chat input area
2. Select an emoji from the picker
3. The emoji will be inserted into your message
4. Send and express yourself! 🎉

### Uploading Files
1. Click the attachment button (📎) next to the emoji button
2. Select any file (images, documents, videos - up to 10MB)
3. Images will show a preview before sending
4. Click Send to share with everyone!
5. Recipients can click to download the file

### Settings & Safety
1. Click the Settings (⚙️) button in the header or landing page
2. **Profanity Filter**: Toggle ON/OFF (OFF by default)
   - When ON: Inappropriate words are replaced with ****
   - When OFF: You see content as-is
3. **Address Blocking** (automatic): For your safety, specific addresses are BLOCKED
   - ✅ ALLOWED: "I'm from California", "I live in Canada", "I'm in Europe"
   - 🚫 BLOCKED: Street addresses, zip codes, phone numbers, coordinates
   - Blocked messages show an error and are NOT sent

### Group Chat vs Private Messages
- **Group Chat** (default): Messages are visible to everyone in the room
- **Private Chat**: Click on a user in the sidebar to send private messages
- Switch between group and private by clicking different users or "Everyone"

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
├── 📁 src-tauri/             # Tauri desktop app config
│   ├── src/main.rs           # Rust entry point
│   ├── Cargo.toml            # Rust dependencies
│   └── tauri.conf.json       # Tauri configuration
├── 📁 .github/workflows/     # GitHub Actions CI/CD
│   └── build-apps.yml        # Build desktop & mobile apps
├── 📁 src/components/ui/     # shadcn/ui components
├── 📁 src/hooks/             # Custom React hooks
├── capacitor.config.json     # Capacitor mobile config
├── package.json              # Main dependencies
├── tailwind.config.ts        # Tailwind configuration
├── HOSTING.md                # Comprehensive hosting guide
├── CONTRIBUTING.md           # Contribution guidelines
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
| `message-blocked` | `{ reason, originalContent }` | Message blocked for safety (address detection) |
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

9. Both users can now chat in real-time with emojis! 🎉

### Testing New Features

**File Uploads:**
- Click the 📎 attachment button in the chat input
- Select any file (up to 10MB)
- Images show a preview before sending
- Files are sent and displayed in chat with download option

**Profanity Filter:**
- OFF by default - content shown as-is
- Click Settings (⚙️) to toggle ON
- When ON, bad words become ****
- Badge shows "Filter ON" in header when active

**Address Blocking (Safety Feature):**
- Try typing an address like "123 Main Street"
- Message will be BLOCKED and not sent
- ✅ Safe: "I'm from California" or "I live in Canada"
- 🚫 Blocked: Full addresses, zip codes, phone numbers, coordinates
- This protects users from accidentally sharing personal info

**Code Persistence:**
- Create a room and join it
- Refresh the page
- Your saved codes will appear on the landing page
- Click any saved code to quickly rejoin

**Group Chat:**
- Have 3+ users join the same room
- Everyone can chat in the group by default
- Click on any user in the sidebar to send private messages

**Emoji Picker:**
- Click the emoji button (😊) next to the input field
- Select an emoji to insert it into your message

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection Error" toast | Make sure the WebSocket server (step 3) is running on port 3003 |
| "Connecting..." spinner stays | Check if port 3003 is blocked by firewall |
| Page doesn't load | Verify Next.js server is running on port 3000 |
| Messages not sending | Check browser console for errors, ensure both servers are running |
| Saved codes not appearing | Check if localStorage is enabled in your browser |
| Emojis not showing | Ensure your browser supports Unicode emojis |
| File too large error | Maximum file size is 10MB - try a smaller file |
| Profanity filter not working | Check Settings to ensure filter is toggled ON |
| Message blocked as address | You tried to share specific location info - use general location only (country/state) |

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
