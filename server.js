const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static('public'));

// Optional: You can handle any route with "/code/:roomId" returning the same index.html
// so that direct links to rooms work. Render static middleware will serve index.html by default
// if it exists. If you need more control, uncomment the following:
// app.get('/code/:roomId', (req, res) => {
//   res.sendFile(__dirname + '/public/index.html');
// });

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('codeChange', ({ roomId, delta }) => {
    // Broadcast to all in room except sender
    socket.to(roomId).emit('codeChange', delta);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// For Render, listen on port from environment or default to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
