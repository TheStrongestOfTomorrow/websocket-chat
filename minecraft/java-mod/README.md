# WebSocket Chat - Minecraft Java Mod

**Version: 1.2.2** | Birthday Special Release! 🎂

Connect to WebSocket Chat from Minecraft Java Edition!

## 🎮 Supported Versions

| Version | Status |
|---------|--------|
| **1.26.x** (2026) | ✅ Fully Supported |
| **1.21.x** | ✅ Fully Supported |
| **1.20.x+** | ✅ Fully Supported |

## ✨ Features

- 💬 Real-time chat with friends
- 🎤 Voice Messages support
- 📞 Voice Calls integration
- 🖥️ Screen Sharing notifications
- 🎨 In-game commands

## 📥 Installation

1. Download from [GitHub Releases](https://github.com/TheStrongestOfTomorrow/websocket-chat/releases)
2. Place `.jar` in your `mods` folder
3. Requires Fabric Loader and Fabric API

### Requirements

- Minecraft Java Edition 1.20.0+ (or 1.26.x)
- [Fabric Loader](https://fabricmc.net/use/) 0.15.0+
- [Fabric API](https://www.curseforge.com/minecraft/mc-mods/fabric-api) latest
- Java 21+

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

## 🔗 Server Connection

⚠️ **Demo is temporarily offline.** You'll need to run your own server!

To host your own server:
1. Clone the main repo
2. Follow HOSTING.md instructions
3. Update the WebSocket URL in `ChatClient.java`

## 🔨 Building from Source

```bash
git clone https://github.com/TheStrongestOfTomorrow/websocket-chat
cd websocket-chat/minecraft/java-mod
./gradlew build
```

The mod will be in `build/libs/`

---

Made with ❤️ for WebSocket Chat | 🎂 Birthday Special!
