import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { WebSocketServer } from "ws";
import { db } from "./db";
import { communityMessages as communityMessagesTable } from "@shared/schema";

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

      // Setup WebSocket for community chat and messaging
      const wss = new WebSocketServer({ server });
      wss.on('connection', (ws) => {
        ws.on('message', async (raw) => {
          try {
            const msg = JSON.parse(raw.toString());
            if (msg.type === 'community_message') {
              const payload = { communityId: msg.communityId, authorId: msg.authorId, content: msg.content };
              if (db) {
                await db.insert(communityMessagesTable).values(payload).returning();
              }
              wss.clients.forEach((client) => {
                if ((client as any).readyState === 1) {
                  client.send(JSON.stringify({ type: 'community_message', ...payload, createdAt: new Date().toISOString() }));
                }
              });
            } else if (msg.type === 'message') {
              // Handle real-time messaging
              const payload = { 
                conversationId: msg.conversationId, 
                senderId: msg.senderId, 
                content: msg.content,
                type: msg.messageType || 'text',
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
          } catch {}
        });
      });
    });
  };

  listenOn(basePort, 10);
})();
