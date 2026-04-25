const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // انضمام المستخدم لغرفة النادي
    socket.on('join_club', (clubId) => {
      socket.join(`club_${clubId}`);
    });

    socket.on('disconnect', () => {
      // تم قطع الاتصال
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io لم يتم تهيئته بعد');
  }
  return io;
};

// إرسال إشعار لجميع أعضاء النادي
const emitToClub = (clubId, event, data) => {
  if (io) {
    io.to(`club_${clubId}`).emit(event, data);
  }
};

module.exports = { initSocket, getIO, emitToClub };
