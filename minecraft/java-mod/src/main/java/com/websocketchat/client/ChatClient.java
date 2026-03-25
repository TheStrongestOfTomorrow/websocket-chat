package com.websocketchat.client;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.WebSocket;
import java.util.concurrent.CompletionStage;
import java.util.function.Consumer;

public class ChatClient {
    private static final Logger LOGGER = LoggerFactory.getLogger("ChatClient");
    private static final Gson GSON = new Gson();
    
    private WebSocket webSocket;
    private boolean connecting = false;
    private Consumer<String> messageHandler;
    
    public ChatClient() {
    }
    
    public void connect(Consumer<String> onMessage) {
        if (connecting || (webSocket != null && !webSocket.isInputClosed())) {
            return;
        }
        
        this.messageHandler = onMessage;
        this.connecting = true;
        
        try {
            HttpClient client = HttpClient.newHttpClient();
            WebSocketChatMod.getInstance().getExecutor().submit(() -> {
                try {
                    client.newWebSocketBuilder()
                        .buildAsync(URI.create(WebSocketChatMod.WS_URL), new WebSocket.Listener() {
                            @Override
                            public void onOpen(WebSocket webSocket) {
                                LOGGER.info("Connected to WebSocket server");
                                ChatClient.this.webSocket = webSocket;
                                ChatClient.this.connecting = false;
                                WebSocketChatMod.getInstance().setConnected(true);
                                webSocket.request(1);
                            }
                            
                            @Override
                            public CompletionStage<?> onText(WebSocket webSocket, CharSequence data, boolean last) {
                                String message = data.toString();
                                LOGGER.debug("Received: {}", message);
                                if (messageHandler != null) {
                                    messageHandler.accept(message);
                                }
                                webSocket.request(1);
                                return null;
                            }
                            
                            @Override
                            public CompletionStage<?> onClose(WebSocket webSocket, int statusCode, String reason) {
                                LOGGER.info("Disconnected: {} - {}", statusCode, reason);
                                ChatClient.this.webSocket = null;
                                WebSocketChatMod.getInstance().setConnected(false);
                                return null;
                            }
                            
                            @Override
                            public void onError(WebSocket webSocket, Throwable error) {
                                LOGGER.error("WebSocket error", error);
                                ChatClient.this.connecting = false;
                                WebSocketChatMod.getInstance().setConnected(false);
                            }
                        });
                } catch (Exception e) {
                    LOGGER.error("Failed to connect", e);
                    ChatClient.this.connecting = false;
                }
            });
        } catch (Exception e) {
            LOGGER.error("Failed to create WebSocket", e);
            this.connecting = false;
        }
    }
    
    public void disconnect() {
        if (webSocket != null) {
            webSocket.sendClose(WebSocket.NORMAL_CLOSURE, "Goodbye");
            webSocket = null;
        }
        WebSocketChatMod.getInstance().setConnected(false);
    }
    
    public void send(String event, JsonObject data) {
        if (webSocket != null && !webSocket.isInputClosed()) {
            JsonObject message = new JsonObject();
            message.addProperty("event", event);
            message.add("data", data);
            webSocket.sendText(GSON.toJson(message), true);
            LOGGER.debug("Sent: {}", message);
        }
    }
    
    public void sendRaw(String json) {
        if (webSocket != null && !webSocket.isInputClosed()) {
            webSocket.sendText(json, true);
            LOGGER.debug("Sent raw: {}", json);
        }
    }
    
    public boolean isConnected() {
        return webSocket != null && !webSocket.isInputClosed();
    }
    
    public boolean isConnecting() {
        return connecting;
    }
}
