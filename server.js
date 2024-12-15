const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store room states in memory. Key: roomId (string), Value: current text (string)
const rooms = {};

// Serve static files
app.use(express.static('public'));

// Catch-all route to serve index.html for any path
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('joinRoom', (roomId) => {
    currentRoom = roomId;
    socket.join(roomId);
    // Send current room text to the new client, if any
    const roomText = rooms[roomId] || "";
    socket.emit('initText', roomText);
  });

  socket.on('codeChange', ({ roomId, fullText }) => {
    // Only proceed if the text is actually different to minimize unnecessary broadcasts
    if (rooms[roomId] !== fullText) {
      rooms[roomId] = fullText;
      // Broadcast the updated full text to other clients in the room
      socket.to(roomId).emit('codeChange', fullText);
    }
  });

  socket.on('disconnect', () => {
    // No cleanup needed for rooms since we want them persistent
    // If you want memory optimization, you could implement a timeout to clear empty rooms.
  });
});

// Use the PORT given by Render or default to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
