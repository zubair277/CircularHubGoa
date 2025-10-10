import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { WebSocketServer } from "ws";
import { db, driver } from "./db";
import { communityMessages as communityMessagesTable } from "@shared/schema";
import { sql } from "drizzle-orm";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Load env vars locally when not provided by hosting
  try {
    await import("dotenv/config");
  } catch {}
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Setup WebSocket for community chat and messaging (outside of listen to avoid multiple instances)
  const wss = new WebSocketServer({ server });
  const userConnections = new Map<string, any>(); // Track user connections

  // Setup WebSocket event handlers (only once)
  wss.on('connection', (ws: any) => {
    // Add error handling for WebSocket
    ws.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
    // Handle user authentication/identification
    ws.on('message', async (raw: any) => {
      try {
        const msg = JSON.parse(raw.toString());
        
        if (msg.type === 'authenticate') {
          // Store user connection
          userConnections.set(msg.userId, ws);
          ws.userId = msg.userId; // Store userId on websocket
          return;
        }
        
        if (msg.type === 'community_message') {
          const payload = { communityId: msg.communityId, authorId: msg.authorId, content: msg.content };
          if (db) {
            if (driver === 'mysql') {
              // @ts-ignore
              await db.execute(sql`INSERT INTO community_messages (community_id, author_id, content) VALUES (${payload.communityId}, ${payload.authorId}, ${payload.content});`);
            } else {
              await db.insert(communityMessagesTable).values(payload).returning();
            }
          }
          wss.clients.forEach((client) => {
            if ((client as any).readyState === 1) {
              client.send(JSON.stringify({ type: 'community_message', ...payload, createdAt: new Date().toISOString() }));
            }
          });
        } else if (msg.type === 'direct_message') {
          // Handle direct messaging between users
          const { conversationId, senderId, receiverId, content } = msg;
          
          if (db && driver === 'mysql') {
            // Save message to database
            await db.execute(
              sql`INSERT INTO messages (conversation_id, sender_id, receiver_id, content) VALUES (${conversationId}, ${senderId}, ${receiverId}, ${content})`
            );
            
            // Update conversation timestamp
            await db.execute(
              sql`UPDATE conversations SET updated_at = NOW() WHERE id = ${conversationId}`
            );
          }
          
          // Send message to receiver if they're connected
          const receiverWs = userConnections.get(receiverId);
          if (receiverWs && receiverWs.readyState === 1) {
            receiverWs.send(JSON.stringify({
              type: 'direct_message',
              conversationId,
              senderId,
              receiverId,
              content,
              createdAt: new Date().toISOString()
            }));
          }
          
          // Send confirmation back to sender
          ws.send(JSON.stringify({
            type: 'message_sent',
            conversationId,
            senderId,
            receiverId,
            content,
            createdAt: new Date().toISOString()
          }));
        } else if (msg.type === 'message') {
          // Handle legacy message format
          const payload: any = { 
            conversationId: msg.conversationId, 
            senderId: msg.senderId, 
            content: msg.content,
            messageType: msg.messageType || 'text',
            offerAmount: msg.offerAmount
          };
          wss.clients.forEach((client) => {
            if ((client as any).readyState === 1) {
              client.send(JSON.stringify({ 
                type: 'message',
                ...payload, 
                id: msg.id || 'temp-id',
                createdAt: new Date().toISOString() 
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    // Handle connection close
    ws.on('close', () => {
      if (ws.userId) {
        userConnections.delete(ws.userId);
      }
    });
  });

  // Windows-safe listen, with retry if port in use
  const basePort = parseInt(process.env.PORT || '5000', 10);
  const listenOn = (candidatePort: number, remainingRetries: number) => {
    const listenOptions: any = {
      port: candidatePort,
      host: "0.0.0.0",
    };
    if (process.platform !== 'win32') {
      listenOptions.reusePort = true;
    }

    const onError = (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' && remainingRetries > 0) {
        const nextPort = candidatePort + 1;
        log(`port ${candidatePort} in use, retrying on ${nextPort}…`);
        server.off('error', onError);
        listenOn(nextPort, remainingRetries - 1);
      } else {
        throw err;
      }
    };

    server.once('error', onError);
    server.listen(listenOptions, () => {
      server.off('error', onError);
      log(`serving on port ${candidatePort}`);
    });
  };

  listenOn(basePort, 10);
})();
