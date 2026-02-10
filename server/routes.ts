import type { Express } from "express";
import { createServer, type Server, request as httpRequest } from "http";
import { spawn, ChildProcess } from "child_process";
import path from "path";

let flaskProcess: ChildProcess | null = null;

function startFlask(): Promise<void> {
  return new Promise((resolve) => {
    if (flaskProcess) {
      resolve();
      return;
    }

    console.log('Starting Flask backend on port 5001...');
    
    const pythonPath = 'python';
    const scriptPath = path.join(process.cwd(), 'backend', 'app.py');
    
    flaskProcess = spawn(pythonPath, [scriptPath], {
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    flaskProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Running on')) {
        console.log('Flask backend started successfully');
        resolve();
      }
      console.log(`[Flask] ${output.trim()}`);
    });

    flaskProcess.stderr?.on('data', (data) => {
      console.error(`[Flask Error] ${data.toString().trim()}`);
    });

    flaskProcess.on('close', (code) => {
      console.log(`Flask process exited with code ${code}`);
      flaskProcess = null;
    });

    setTimeout(() => resolve(), 3000);
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await startFlask();
  
  const FLASK_PORT = 5001;
  const FLASK_HOST = '127.0.0.1';

  const proxyToFlask = (req: any, res: any) => {
    const options = {
      hostname: FLASK_HOST,
      port: FLASK_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${FLASK_HOST}:${FLASK_PORT}`,
      },
    };

    const proxyReq = httpRequest(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('Flask proxy error:', err.message);
      if (!res.headersSent) {
        res.status(502).json({ 
          error: 'Backend service unavailable',
          message: 'Flask server may not be running on port 5001'
        });
      }
    });

    if (req.body && Object.keys(req.body).length > 0) {
      proxyReq.write(JSON.stringify(req.body));
    }

    proxyReq.end();
  };

  app.all('/api/*', proxyToFlask);

  return httpServer;
}
