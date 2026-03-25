# WebSocket Chat - Minecraft Bedrock Addon

Connect to WebSocket Chat from Minecraft Bedrock Edition!

## 🎮 Supported Versions

| Version | Status |
|---------|--------|
| **26.x** (2026) | ✅ Fully Supported |
| **1.21.x** | ✅ Fully Supported |
| **1.20.x** | ✅ Fully Supported |
| **1.19.0+** | ✅ Fully Supported |

## 📥 Installation

1. Download `WebSocketChat.mcaddon` from [GitHub Releases](https://github.com/TheStrongestOfTomorrow/websocket-chat/releases)
2. Double-click to open with Minecraft
3. Or manually copy to `behavior_packs` folder

## 🎮 Usage

### Commands

| Command | Description |
|---------|-------------|
| `!help` | Show all commands |
| `!menu` | Open UI menu |
| `!host <username>` | Create a new room |
| `!join <username> <code>` | Join a room |
| `!chat <message>` | Send a message |
| `!leave` | Leave current room |
| `!status` | Show connection status |

### Quick Start

1. **Create a room:**
   ```
   !host Steve
   ```
   You'll get a 6-character room code like `A3K7XM`

2. **Share the code** with friends!

3. **Friends join:**
   ```
   !join Alex A3K7XM
   ```

4. **Chat!**
   ```
   !chat Hello from Minecraft!
   ```
   Or just type normally when connected!

## 🖥️ UI Menu

Type `!menu` to open a graphical interface for:
- Creating rooms
- Joining rooms
- Sending messages
- Copying room codes

## ⚠️ Requirements

- Minecraft Bedrock Edition 1.19.0+ (or 26.x)
- Enable "Beta APIs" in world settings

## 🔗 Server Connection

⚠️ **Demo is temporarily offline.** You'll need to run your own server!

Default server: `wss://socket-chat.space.z.ai` (offline)

## 📁 Self-Hosting

To host your own server:
1. Clone the main repo
2. Follow HOSTING.md instructions
3. Update the WebSocket URL in `scripts/main.js`

---

Made with ❤️ for WebSocket Chat
