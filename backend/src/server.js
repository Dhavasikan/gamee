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

const distPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start listening
server.listen(PORT, () => {
  console.log(`👑 Raja Rani Game Server running on port ${PORT}`);
  console.log(`🌐 Application URL: http://localhost:${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});
