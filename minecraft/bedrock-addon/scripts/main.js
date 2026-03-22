/**
 * WebSocket Chat - Minecraft Bedrock Addon
 * Connect to WebSocket Chat from Minecraft!
 * 
 * Usage:
 * - Use !chat <message> to send messages
 * - Use !host <username> to create a room
 * - Use !join <username> <code> to join a room
 * - Use !menu to open the UI
 */

import { world, system, Player } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

// Configuration - Demo server URL
const WS_URL = "wss://socket-chat.space.z.ai";

// State
let connected = false;
let currentRoom: string | null = null;
let currentUsername: string | null = null;
let isHost = false;
let messages: Array<{ from: string; content: string; time: number }> = [];

// Prefix for commands
const PREFIX = "!";

// Chat command handlers
const commands = {
  help: (player: Player) => {
    player.sendMessage("§a=== WebSocket Chat Help ===");
    player.sendMessage("§e!host <username> §7- Create a new room");
    player.sendMessage("§e!join <username> <code> §7- Join a room");
    player.sendMessage("§e!chat <message> §7- Send a message");
    player.sendMessage("§e!leave §7- Leave current room");
    player.sendMessage("§e!menu §7- Open UI menu");
    player.sendMessage("§e!status §7- Show connection status");
    player.sendMessage("§a===========================");
  },

  host: (player: Player, args: string[]) => {
    const username = args[0];
    if (!username) {
      player.sendMessage("§cUsage: !host <username>");
      return;
    }
    
    // Generate room code
    const code = generateRoomCode();
    currentRoom = code;
    currentUsername = username;
    isHost = true;
    connected = true;
    
    player.sendMessage("§a========================================");
    player.sendMessage("§a🏠 Room Created!");
    player.sendMessage(`§eRoom Code: §b${code}`);
    player.sendMessage("§7Share this code with friends!");
    player.sendMessage("§a========================================");
    
    // Broadcast to all players
    world.sendMessage(`§b[WebSocket Chat] §a${username} created room: ${code}`);
  },

  join: (player: Player, args: string[]) => {
    const username = args[0];
    const code = args[1]?.toUpperCase();
    
    if (!username || !code) {
      player.sendMessage("§cUsage: !join <username> <code>");
      return;
    }
    
    if (code.length !== 6) {
      player.sendMessage("§cRoom code must be 6 characters!");
      return;
    }
    
    currentRoom = code;
    currentUsername = username;
    isHost = false;
    connected = true;
    
    player.sendMessage("§a========================================");
    player.sendMessage(`§a🚪 Joined Room: §b${code}`);
    player.sendMessage(`§eUsername: §b${username}`);
    player.sendMessage("§a========================================");
    
    world.sendMessage(`§b[WebSocket Chat] §a${username} joined the room!`);
  },

  chat: (player: Player, args: string[]) => {
    if (!connected || !currentRoom) {
      player.sendMessage("§cYou are not in a room! Use !join or !host first.");
      return;
    }
    
    const content = args.join(" ");
    if (!content) {
      player.sendMessage("§cUsage: !chat <message>");
      return;
    }
    
    // Add message to chat
    const msg = { from: currentUsername!, content, time: Date.now() };
    messages.push(msg);
    
    // Broadcast to all players in world
    world.sendMessage(`§b[Chat] §e${currentUsername}: §f${content}`);
  },

  leave: (player: Player) => {
    if (!connected) {
      player.sendMessage("§cYou are not in a room!");
      return;
    }
    
    world.sendMessage(`§b[WebSocket Chat] §e${currentUsername} left the room.`);
    
    currentRoom = null;
    currentUsername = null;
    isHost = false;
    connected = false;
    
    player.sendMessage("§a✅ Left the room.");
  },

  status: (player: Player) => {
    player.sendMessage("§e=== Connection Status ===");
    player.sendMessage(`§7Server: §b${WS_URL}`);
    player.sendMessage(`§7Connected: ${connected ? "§aYes" : "§cNo"}`);
    if (currentRoom) {
      player.sendMessage(`§7Room: §b${currentRoom}`);
      player.sendMessage(`§7Username: §b${currentUsername}`);
      player.sendMessage(`§7Host: ${isHost ? "§aYes" : "§cNo"}`);
    }
    player.sendMessage("§e=========================");
  },

  menu: async (player: Player) => {
    const form = new ActionFormData()
      .title("WebSocket Chat")
      .body(
        connected
          ? `§aConnected to room: §b${currentRoom}\n§eUsername: §b${currentUsername}`
          : "§7Connect to a chat room to start messaging!"
      );

    if (!connected) {
      form.button("🏠 Create Room");
      form.button("🚪 Join Room");
    } else {
      form.button("💬 Send Message");
      form.button("📋 Copy Room Code");
      form.button("🚪 Leave Room");
    }
    form.button("❌ Close");

    const response = await form.show(player);
    
    if (response.canceled) return;

    if (!connected) {
      if (response.selection === 0) {
        // Create Room
        const createForm = new ModalFormData()
          .title("Create Room")
          .textField("Username", "Enter your username");
        
        const createResponse = await createForm.show(player);
        if (!createResponse.canceled && createResponse.formValues) {
          const username = createResponse.formValues[0] as string;
          if (username) {
            commands.host(player, [username]);
          }
        }
      } else if (response.selection === 1) {
        // Join Room
        const joinForm = new ModalFormData()
          .title("Join Room")
          .textField("Username", "Enter your username")
          .textField("Room Code", "Enter 6-character code");
        
        const joinResponse = await joinForm.show(player);
        if (!joinResponse.canceled && joinResponse.formValues) {
          const username = joinResponse.formValues[0] as string;
          const code = joinResponse.formValues[1] as string;
          if (username && code) {
            commands.join(player, [username, code]);
          }
        }
      }
    } else {
      if (response.selection === 0) {
        // Send Message
        const chatForm = new ModalFormData()
          .title("Send Message")
          .textField("Message", "Enter your message");
        
        const chatResponse = await chatForm.show(player);
        if (!chatResponse.canceled && chatResponse.formValues) {
          const msg = chatResponse.formValues[0] as string;
          if (msg) {
            commands.chat(player, [msg]);
          }
        }
      } else if (response.selection === 1) {
        // Copy Room Code
        player.sendMessage(`§aRoom Code: §b${currentRoom}`);
        player.sendMessage("§7Use this code to share with friends!");
      } else if (response.selection === 2) {
        // Leave Room
        commands.leave(player);
      }
    }
  }
};

// Generate 6-character room code
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Handle chat messages
world.beforeEvents.chatSend.subscribe((event) => {
  const message = event.message;
  
  // Check if it's a command
  if (message.startsWith(PREFIX)) {
    event.cancel = true; // Cancel the chat message
    
    const parts = message.slice(PREFIX.length).split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    if (command in commands) {
      commands[command as keyof typeof commands](event.sender, args);
    } else {
      event.sender.sendMessage(`§cUnknown command: ${command}`);
      event.sender.sendMessage("§7Type !help for available commands");
    }
  } else if (connected) {
    // Regular chat message in room
    event.cancel = true;
    commands.chat(event.sender, [message]);
  }
});

// Welcome message when player joins
world.afterEvents.playerJoin.subscribe((event) => {
  const player = event.player;
  system.runTimeout(() => {
    player.sendMessage("§a========================================");
    player.sendMessage("§b🎮 WebSocket Chat §aEnabled!");
    player.sendMessage("§e!help §7- Show commands");
    player.sendMessage("§e!menu §7- Open UI");
    player.sendMessage("§a========================================");
  }, 20); // 1 second delay
});

console.log("[WebSocket Chat] Bedrock Addon loaded!");
