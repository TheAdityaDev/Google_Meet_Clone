import { Server } from "socket.io";

let ioInstance;
const userSocketMap = {}; // Tracks { userId: socketId }

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

export const getIO = () => {
  return ioInstance;
};

export const initializeSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        const allowedOrigins = [
          "http://localhost:5173",
          "http://localhost:5174",
          process.env.CORS_ORIGIN,
        ].filter(Boolean);
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;
      ioInstance.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    // Chat Room Join/Leave
    socket.on("chat:join", (chatId) => {
      socket.join(chatId);
    });

    socket.on("chat:leave", (chatId) => {
      socket.leave(chatId);
    });

    // Typing Indicators
    socket.on("typing:start", ({ chatId, senderId, receiverId }) => {
      if (chatId) {
        socket.to(chatId).emit("typing:start", { chatId, senderId });
      } else if (receiverId) {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          socket.to(receiverSocketId).emit("typing:start", { chatId, senderId });
        }
      }
    });

    socket.on("typing:stop", ({ chatId, senderId, receiverId }) => {
      if (chatId) {
        socket.to(chatId).emit("typing:stop", { chatId, senderId });
      } else if (receiverId) {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          socket.to(receiverSocketId).emit("typing:stop", { chatId, senderId });
        }
      }
    });

    // WebRTC Signaling
    socket.on("call:initiate", ({ callerId, calleeId, offer, callerName, callerPic, chatId }) => {
      const calleeSocketId = getReceiverSocketId(calleeId);
      if (calleeSocketId) {
        ioInstance.to(calleeSocketId).emit("call:incoming", {
          callerId,
          offer,
          callerName,
          callerPic,
          chatId,
        });
      } else {
        socket.emit("call:failed", { reason: "User is offline" });
      }
    });

    socket.on("call:accept", ({ callerId, calleeId, answer }) => {
      const callerSocketId = getReceiverSocketId(callerId);
      if (callerSocketId) {
        ioInstance.to(callerSocketId).emit("call:accepted", { calleeId, answer });
      }
    });

    socket.on("call:reject", ({ callerId, calleeId }) => {
      const callerSocketId = getReceiverSocketId(callerId);
      if (callerSocketId) {
        ioInstance.to(callerSocketId).emit("call:rejected", { calleeId });
      }
    });

    socket.on("webrtc:signal", ({ recipientId, signal }) => {
      const recipientSocketId = getReceiverSocketId(recipientId);
      if (recipientSocketId) {
        ioInstance.to(recipientSocketId).emit("webrtc:signal", { senderId: userId, signal });
      }
    });

    socket.on("call:end", ({ peerId }) => {
      const peerSocketId = getReceiverSocketId(peerId);
      if (peerSocketId) {
        ioInstance.to(peerSocketId).emit("call:ended");
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (userId && userId !== "undefined") {
        delete userSocketMap[userId];
        ioInstance.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    });
  });

  return ioInstance;
};
