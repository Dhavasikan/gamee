/**
 * Raja Rani - Backend Server
 * Express + Socket.IO server
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const { RoomManager } = require('./roomManager');
const { setupSocketHandlers } = require('./socketHandlers');
const { getRecentGames } = require('./db');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager();
setupSocketHandlers(io, roomManager);

// API Endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), activeRooms: roomManager.rooms.size });
});

app.get('/api/recent-games', (req, res) => {
  getRecentGames(10, (err, games) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve games' });
    }
    res.json({ games });
  });
});

const fs = require('fs');

// Check possible paths for frontend dist
const possibleDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(process.cwd(), 'dist')
];

let distPath = possibleDistPaths.find(p => fs.existsSync(p));

if (distPath) {
  console.log(`📦 Serving static frontend from: ${distPath}`);
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('⚠️ WARNING: frontend/dist not found in any standard path! Checked:', possibleDistPaths);
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.status(503).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 3rem; background: #0c081e; color: #ffd700; min-height: 100vh;">
        <h1>👑 Raja Rani Royale</h1>
        <p style="color: #cbd5e1;">Backend is active, but the frontend build is missing.</p>
        <p style="color: #94a3b8;">Please run <code>npm run render:build</code> on Render or include <code>frontend/dist</code> in git.</p>
      </div>
    `);
  });
}

// Start listening - bind to 0.0.0.0 for cloud hosting (Render, Railway, Fly, Docker)
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`👑 Raja Rani Game Server running on port ${PORT} (${HOST})`);
  console.log(`🌐 Application URL: http://localhost:${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});
