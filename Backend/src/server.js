import express from "express";
const app = express();
import "dotenv/config";
import cors from 'cors'
// auth route
import authRoute from "./routes/auth.route.js";
// user route
import userRoutes from "./routes/user.route.js";
// chat route
import chatRoutes from "./routes/chat.route.js"
// Db connection 
import { ConnectToDB } from "./lib/db.config.js";
import cookieParser from "cookie-parser";

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello world");
});

const allowedOrigin = process.env.CORS_ORIGIN;

// set limit to request to apis


app.use(cors({
    origin : allowedOrigin, 
    credentials : true
}))
app.use(cookieParser());
app.use(express.json());


// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);


app.listen(port, () => {
  console.log(`Port ruinng on ${port}`);
  ConnectToDB();
});
