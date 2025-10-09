import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

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

  const basePort = parseInt(process.env.PORT || '5000', 10);
  const listenOn = (candidatePort: number, remainingRetries: number) => {
    const listenOptions: any = {
      port: candidatePort,
      host: "0.0.0.0",
    };
    if (process.platform !== "win32") {
      listenOptions.reusePort = true;
    }

    const onError = (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' && remainingRetries > 0) {
        const nextPort = candidatePort + 1;
        log(`port ${candidatePort} in use, retrying on ${nextPort}…`);
        server.off('error', onError);
        // Try the next port
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
