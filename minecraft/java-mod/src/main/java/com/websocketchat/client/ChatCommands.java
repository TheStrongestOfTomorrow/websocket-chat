package com.websocketchat.client;

import com.mojang.brigadier.CommandDispatcher;
import com.mojang.brigadier.arguments.StringArgumentType;
import net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource;
import net.minecraft.client.MinecraftClient;
import net.minecraft.text.Text;

import java.util.Random;

import static net.fabricmc.fabric.api.client.command.v2.ClientCommandManager.*;

public class ChatCommands {
    
    public static void register(CommandDispatcher<FabricClientCommandSource> dispatcher) {
        // Help command
        dispatcher.register(literal("wchelp")
            .executes(context -> {
                sendHelp(context.getSource());
                return 1;
            })
        );
        
        // Status command
        dispatcher.register(literal("wcstatus")
            .executes(context -> {
                sendStatus(context.getSource());
                return 1;
            })
        );
        
        // Menu command (opens GUI)
        dispatcher.register(literal("wcmenu")
            .executes(context -> {
                // For now, just show help - full GUI would need mixin
                context.getSource().sendFeedback(Text.literal("§a=== WebSocket Chat Menu ==="));
                sendHelp(context.getSource());
                return 1;
            })
        );
        
        // Host command
        dispatcher.register(literal("wchost")
            .then(argument("username", StringArgumentType.word())
                .executes(context -> {
                    String username = StringArgumentType.getString(context, "username");
                    hostRoom(context.getSource(), username);
                    return 1;
                })
            )
        );
        
        // Join command
        dispatcher.register(literal("wcjoin")
            .then(argument("username", StringArgumentType.word())
                .then(argument("code", StringArgumentType.word())
                    .executes(context -> {
                        String username = StringArgumentType.getString(context, "username");
                        String code = StringArgumentType.getString(context, "code").toUpperCase();
                        joinRoom(context.getSource(), username, code);
                        return 1;
                    })
                )
            )
        );
        
        // Chat command
        dispatcher.register(literal("wc")
            .then(argument("message", StringArgumentType.greedyString())
                .executes(context -> {
                    String message = StringArgumentType.getString(context, "message");
                    sendChatMessage(context.getSource(), message);
                    return 1;
                })
            )
        );
        
        // Leave command
        dispatcher.register(literal("wcleave")
            .executes(context -> {
                leaveRoom(context.getSource());
                return 1;
            })
        );
        
        // Connect command
        dispatcher.register(literal("wcconnect")
            .executes(context -> {
                connect(context.getSource());
                return 1;
            })
        );
        
        // Disconnect command
        dispatcher.register(literal("wcdisconnect")
            .executes(context -> {
                disconnect(context.getSource());
                return 1;
            })
        );
    }
    
    private static void sendHelp(FabricClientCommandSource source) {
        source.sendFeedback(Text.literal("§a=== WebSocket Chat Help ==="));
        source.sendFeedback(Text.literal("§e/wcconnect §7- Connect to server"));
        source.sendFeedback(Text.literal("§e/wchost <username> §7- Create a room"));
        source.sendFeedback(Text.literal("§e/wcjoin <username> <code> §7- Join a room"));
        source.sendFeedback(Text.literal("§e/wc <message> §7- Send a message"));
        source.sendFeedback(Text.literal("§e/wcleave §7- Leave room"));
        source.sendFeedback(Text.literal("§e/wcstatus §7- Show status"));
        source.sendFeedback(Text.literal("§e/wcdisconnect §7- Disconnect"));
        source.sendFeedback(Text.literal("§a==========================="));
    }
    
    private static void sendStatus(FabricClientCommandSource source) {
        WebSocketChatMod mod = WebSocketChatMod.getInstance();
        source.sendFeedback(Text.literal("§e=== Connection Status ==="));
        source.sendFeedback(Text.literal("§7Server: §b" + WebSocketChatMod.WS_URL));
        source.sendFeedback(Text.literal("§7Connected: " + (mod.isConnected() ? "§aYes" : "§cNo")));
        if (mod.getCurrentRoom() != null) {
            source.sendFeedback(Text.literal("§7Room: §b" + mod.getCurrentRoom()));
            source.sendFeedback(Text.literal("§7Username: §b" + mod.getCurrentUsername()));
            source.sendFeedback(Text.literal("§7Host: " + (mod.isHost() ? "§aYes" : "§cNo")));
        }
        source.sendFeedback(Text.literal("§e========================="));
    }
    
    private static void connect(FabricClientCommandSource source) {
        WebSocketChatMod mod = WebSocketChatMod.getInstance();
        
        if (mod.isConnected()) {
            source.sendFeedback(Text.literal("§cAlready connected!"));
            return;
        }
        
        source.sendFeedback(Text.literal("§eConnecting to server..."));
        
        mod.getChatClient().connect(message -> {
            // Handle incoming messages
            try {
                com.google.gson.JsonObject json = new com.google.gson.Gson().fromJson(message, com.google.gson.JsonObject.class);
                String type = json.has("type") ? json.get("type").getAsString() : "";
                
                if ("message".equals(type) || json.has("content")) {
                    String from = json.has("from") ? json.get("from").getAsString() : "Unknown";
                    String content = json.has("content") ? json.get("content").getAsString() : "";
                    
                    MinecraftClient.getInstance().execute(() -> {
                        mod.sendChatMessage(from, content);
                    });
                }
            } catch (Exception e) {
                // Raw message
                MinecraftClient.getInstance().execute(() -> {
                    mod.sendMessage("§b[Chat] §f" + message);
                });
            }
        });
        
        source.sendFeedback(Text.literal("§aConnected!"));
    }
    
    private static void hostRoom(FabricClientCommandSource source, String username) {
        WebSocketChatMod mod = WebSocketChatMod.getInstance();
        
        if (!mod.isConnected()) {
            // Auto-connect
            connect(source);
        }
        
        // Generate room code
        String code = generateRoomCode();
        mod.setCurrentRoom(code);
        mod.setCurrentUsername(username);
        mod.setHost(true);
        
        source.sendFeedback(Text.literal("§a========================================"));
        source.sendFeedback(Text.literal("§a🏠 Room Created!"));
        source.sendFeedback(Text.literal("§eRoom Code: §b" + code));
        source.sendFeedback(Text.literal("§7Share this code with friends!"));
        source.sendFeedback(Text.literal("§a========================================"));
        
        // Broadcast in-game
        if (MinecraftClient.getInstance().player != null) {
            MinecraftClient.getInstance().player.sendMessage(
                Text.literal("§b[WebSocket Chat] §a" + username + " created room: " + code),
                false
            );
        }
    }
    
    private static void joinRoom(FabricClientCommandSource source, String username, String code) {
        WebSocketChatMod mod = WebSocketChatMod.getInstance();
        
        if (!mod.isConnected()) {
            // Auto-connect
            connect(source);
        }
        
        if (code.length() != 6) {
            source.sendFeedback(Text.literal("§cRoom code must be 6 characters!"));
            return;
        }
        
        mod.setCurrentRoom(code);
        mod.setCurrentUsername(username);
        mod.setHost(false);
        
        source.sendFeedback(Text.literal("§a========================================"));
        source.sendFeedback(Text.literal("§a🚪 Joined Room: §b" + code));
        source.sendFeedback(Text.literal("§eUsername: §b" + username));
        source.sendFeedback(Text.literal("§a========================================"));
        
        if (MinecraftClient.getInstance().player != null) {
            MinecraftClient.getInstance().player.sendMessage(
                Text.literal("§b[WebSocket Chat] §a" + username + " joined the room!"),
                false
            );
        }
    }
    
    private static void sendChatMessage(FabricClientCommandSource source, String message) {
        WebSocketChatMod mod = WebSocketChatMod.getInstance();
        
        if (!mod.isConnected() || mod.getCurrentRoom() == null) {
            source.sendFeedback(Text.literal("§cYou are not in a room! Use /wcjoin or /wchost first."));
            return;
        }
        
        // Send to in-game chat
        mod.sendChatMessage(mod.getCurrentUsername(), message);
        
        // In a real implementation, would send to WebSocket server
        // mod.getChatClient().send("send-message", data);
    }
    
    private static void leaveRoom(FabricClientCommandSource source) {
        WebSocketChatMod mod = WebSocketChatMod.getInstance();
        
        if (mod.getCurrentRoom() == null) {
            source.sendFeedback(Text.literal("§cYou are not in a room!"));
            return;
        }
        
        String username = mod.getCurrentUsername();
        source.sendFeedback(Text.literal("§a✅ Left the room."));
        
        if (MinecraftClient.getInstance().player != null) {
            MinecraftClient.getInstance().player.sendMessage(
                Text.literal("§b[WebSocket Chat] §e" + username + " left the room."),
                false
            );
        }
        
        mod.setCurrentRoom(null);
        mod.setCurrentUsername(null);
        mod.setHost(false);
    }
    
    private static void disconnect(FabricClientCommandSource source) {
        WebSocketChatMod mod = WebSocketChatMod.getInstance();
        
        if (!mod.isConnected()) {
            source.sendFeedback(Text.literal("§cNot connected!"));
            return;
        }
        
        mod.getChatClient().disconnect();
        mod.setConnected(false);
        mod.setCurrentRoom(null);
        mod.setCurrentUsername(null);
        mod.setHost(false);
        
        source.sendFeedback(Text.literal("§aDisconnected from server."));
    }
    
    private static String generateRoomCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder code = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 6; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }
}
