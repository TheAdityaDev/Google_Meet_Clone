import express from "express";
import http from "http";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";

// Db connection
import { ConnectToDB } from "./lib/db.config.js";

// Routes
import authRoute from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

// Socket configuration
import { initializeSocket } from "./socket.js";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

// Initialize socket communication
initializeSocket(server);

// Connect to MongoDB Database
ConnectToDB();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Meet Clone Backend Server is running.");
});

// Route handlers
app.use("/api/auth", authRoute);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


