package com.websocketchat.client;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.minecraft.client.MinecraftClient;
import net.minecraft.text.Text;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class WebSocketChatMod implements ClientModInitializer {
    public static final String MOD_ID = "websocketchat";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);
    public static final String WS_URL = "wss://socket-chat.space.z.ai";
    
    private static WebSocketChatMod instance;
    private ChatClient chatClient;
    private final ExecutorService executor = Executors.newCachedThreadPool();
    
    // State
    private boolean connected = false;
    private String currentRoom = null;
    private String currentUsername = null;
    private boolean isHost = false;
    
    @Override
    public void onInitializeClient() {
        instance = this;
        
        LOGGER.info("WebSocket Chat Mod initialized!");
        LOGGER.info("Server: {}", WS_URL);
        
        // Register commands
        ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> {
            ChatCommands.register(dispatcher);
        });
        
        // Initialize chat client
        chatClient = new ChatClient();
        
        // Show welcome message
        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            if (client.player != null && client.options.attackKey.isPressed()) {
                // First tick - show welcome
                client.player.sendMessage(Text.literal("§a=== WebSocket Chat Mod Loaded ==="), false);
                client.player.sendMessage(Text.literal("§e/wchelp §7- Show commands"), false);
                client.player.sendMessage(Text.literal("§e/wcmenu §7- Open GUI"), false);
                client.player.sendMessage(Text.literal("§a================================="), false);
            }
        });
    }
    
    public static WebSocketChatMod getInstance() {
        return instance;
    }
    
    public ChatClient getChatClient() {
        return chatClient;
    }
    
    public ExecutorService getExecutor() {
        return executor;
    }
    
    public boolean isConnected() {
        return connected;
    }
    
    public void setConnected(boolean connected) {
        this.connected = connected;
    }
    
    public String getCurrentRoom() {
        return currentRoom;
    }
    
    public void setCurrentRoom(String room) {
        this.currentRoom = room;
    }
    
    public String getCurrentUsername() {
        return currentUsername;
    }
    
    public void setCurrentUsername(String username) {
        this.currentUsername = username;
    }
    
    public boolean isHost() {
        return isHost;
    }
    
    public void setHost(boolean host) {
        this.isHost = host;
    }
    
    public void sendMessage(String message) {
        if (MinecraftClient.getInstance().player != null) {
            MinecraftClient.getInstance().player.sendMessage(Text.literal(message), false);
        }
    }
    
    public void sendChatMessage(String from, String content) {
        if (MinecraftClient.getInstance().player != null) {
            MinecraftClient.getInstance().player.sendMessage(
                Text.literal("§b[Chat] §e" + from + ": §f" + content), 
                false
            );
        }
    }
}
