const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this in production
    methods: ["GET", "POST"]
  }
});
app.set('io', io);

// Enable CORS - Must be before body parsers to handle errors correctly
app.use(cors());

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));
// User Routes
app.use('/api/users', require('./routes/userRoutes'));
// Post Routes
app.use('/api/posts', require('./routes/postRoutes'));
// Notification Routes
app.use('/api/notifications', require('./routes/notificationRoutes'));
// Repo Routes
app.use('/api/repos', require('./routes/repoRoutes'));
// Chat Routes
app.use('/api/chats', require('./routes/chatRoutes'));
// Message Routes
app.use('/api/messages', require('./routes/messageRoutes'));
// Stats Routes
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/agent', require('./routes/agentRoutes'));

// Socket.io logic
const users = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    users.set(userData._id, {
      socketId: socket.id,
      userId: userData._id,
      username: userData.username,
      profilePic: userData.profilePic
    });
    socket.emit('connected');
    io.emit('online_users_list', Array.from(users.values()));
  });

  socket.on('join_chat', (room) => {
    socket.join(room);
    console.log('User joined room:', room);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing', room));
  socket.on('stop_typing', (room) => socket.in(room).emit('stop_typing', room));

  socket.on('new_message', (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) return console.log('chat.users not defined');

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;
      socket.in(user._id).emit('message_received', newMessageReceived);
    });
  });

  socket.on('disconnect', () => {
    let disconnectedUserId;
    for (let [userId, data] of users.entries()) {
      if (data.socketId === socket.id) {
        disconnectedUserId = userId;
        users.delete(userId);
        break;
      }
    }
    if (disconnectedUserId) {
      io.emit('online_users_list', Array.from(users.values()));
    }
    console.log('User disconnected');
  });

  // WebRTC Signaling
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("endCall", ({ to }) => {
    io.to(to).emit("callEnded");
  });
});

// Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.error('Stack:', err.stack);
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// ─── Serve React client in production ─────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

