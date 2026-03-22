# WebSocket Chat - Minecraft Java Mod

Connect to WebSocket Chat from Minecraft Java Edition!

## 📥 Installation

1. Download `websocketchat-mod-1.0.0.jar`
2. Place in your `mods` folder
3. Requires Fabric Loader and Fabric API

### Requirements

- Minecraft Java Edition 1.20.4
- [Fabric Loader](https://fabricmc.net/use/) 0.15.6+
- [Fabric API](https://www.curseforge.com/minecraft/mc-mods/fabric-api) 0.96.11+

## 🎮 Commands

| Command | Description |
|---------|-------------|
| `/wcconnect` | Connect to server |
| `/wchost <username>` | Create a new room |
| `/wcjoin <username> <code>` | Join a room |
| `/wc <message>` | Send a message |
| `/wcleave` | Leave current room |
| `/wcstatus` | Show connection status |
| `/wcdisconnect` | Disconnect from server |
| `/wchelp` | Show all commands |
| `/wcmenu` | Open menu (basic) |

## 🎯 Quick Start

1. **Connect to server:**
   ```
   /wcconnect
   ```

2. **Create a room:**
   ```
   /wchost Steve
   ```
   You'll get a 6-character room code like `A3K7XM`

3. **Share the code** with friends!

4. **Friends join:**
   ```
   /wcjoin Alex A3K7XM
   ```

5. **Chat!**
   ```
   /wc Hello from Minecraft!
   ```

## 🔗 Demo Server

By default, connects to: `wss://socket-chat.space.z.ai`

**Note:** Demo server may be temporarily unavailable during maintenance.

## 🔨 Building from Source

```bash
git clone https://github.com/TheStrongestOfTomorrow/websocket-chat
cd websocket-chat/minecraft/java-mod
./gradlew build
```

The mod will be in `build/libs/`

## 📁 Self-Hosting

If you want to host your own server:
1. Clone the main repo
2. Follow HOSTING.md instructions
3. The chat will work with your server!

---

Made with ❤️ for WebSocket Chat
