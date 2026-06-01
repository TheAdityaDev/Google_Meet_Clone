import express from "express";
import { protectedRoute } from "../middleware/auth.middleare.js";
import {
  getChats,
  getOrCreateDirectChat,
  createGroupChat,
  getChatMessages,
  sendMessage,
  markChatAsSeen,
  updateGroup,
  deleteGroup,
  addGroupParticipants,
  removeGroupParticipant,
  votePoll,
  editMessage,
  deleteMessage,
  joinGroupViaLink,
  getGroupInviteInfo,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Apply auth protection middleware to all chat endpoints
router.use(protectedRoute);

router.get("/", getChats);
router.post("/direct", getOrCreateDirectChat);
router.post("/group", createGroupChat);
router.get("/:chatId/messages", getChatMessages);
router.post("/:chatId/message", sendMessage);
router.put("/:chatId/seen", markChatAsSeen);

// Group Chat CRUD Routing
router.put("/group/:chatId", updateGroup);
router.delete("/group/:chatId", deleteGroup);
router.put("/group/:chatId/members/add", addGroupParticipants);
router.put("/group/:chatId/members/remove", removeGroupParticipant);
router.put("/group/:chatId/join", joinGroupViaLink); // Join via invite link
router.get("/group/:chatId/invite-info", getGroupInviteInfo); // Get group invite details

// Poll Voting Routing
router.put("/message/:messageId/vote", votePoll);

// Message Edit / Delete Routing
router.put("/message/:messageId", editMessage);
router.delete("/message/:messageId", deleteMessage);

export default router;