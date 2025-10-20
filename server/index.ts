import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { WebSocketServer } from "ws";
import { prisma } from "../lib/prisma";

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
          const { communityId, authorId, content } = msg;
          
          try {
            // Save message to database using Prisma
            const savedMessage = await prisma.communityMessage.create({
              data: {
                communityId,
                authorId,
                content
              },
              include: {
                author: {
                  select: {
                    businessName: true,
                    avatar: true
                  }
                }
              }
            });

            // Broadcast to all connected clients
            wss.clients.forEach((client) => {
              if ((client as any).readyState === 1) {
                client.send(JSON.stringify({ 
                  type: 'community_message', 
                  ...savedMessage
                }));
              }
            });
          } catch (error) {
            console.error('Error saving community message:', error);
          }
        } else if (msg.type === 'direct_message') {
          // Handle direct messaging between users
          const { conversationId, senderId, receiverId, content } = msg;
          
          try {
            // Save message to database using Prisma
            const savedMessage = await prisma.message.create({
              data: {
                conversationId,
                senderId,
                receiverId,
                content
              }
            });

            // Update conversation timestamp
            await prisma.conversation.update({
              where: { id: conversationId },
              data: { updatedAt: new Date() }
            });
          
            // Send message to receiver if they're connected
            const receiverWs = userConnections.get(receiverId);
            if (receiverWs && receiverWs.readyState === 1) {
              receiverWs.send(JSON.stringify({
                type: 'direct_message',
                ...savedMessage
              }));
            }
          
            // Send confirmation back to sender
            ws.send(JSON.stringify({
              type: 'message_sent',
              ...savedMessage
            }));
          } catch (error) {
            console.error('Error saving direct message:', error);
          }
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
