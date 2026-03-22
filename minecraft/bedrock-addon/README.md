# WebSocket Chat - Minecraft Bedrock Addon

Connect to WebSocket Chat from Minecraft Bedrock Edition!

## 📥 Installation

1. Download `WebSocketChat.mcaddon`
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

- Minecraft Bedrock Edition 1.19.0+
- Enable "Beta APIs" in world settings

## 🔗 Demo Server

By default, connects to: `wss://socket-chat.space.z.ai`

**Note:** Demo server may be temporarily unavailable during maintenance.

## 📁 Self-Hosting

If you want to host your own server:
1. Clone the main repo
2. Follow HOSTING.md instructions
3. The chat will work with your server!

---

Made with ❤️ for WebSocket Chat
