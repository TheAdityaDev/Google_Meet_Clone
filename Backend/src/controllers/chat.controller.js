import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { getIO } from "../socket.js";

// Fetch all chats for logged-in user (both Direct and Group)
export async function getChats(req, res) {
  try {
    const userId = req.user.id;
    const chats = await chatModel
      .find({ participants: userId })
      .populate("participants", "fullname email profilePic location isOnboarded")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "fullname profilePic" },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get or Create a Direct Chat with another user
export async function getOrCreateDirectChat(req, res) {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    let chat = await chatModel.findOne({
      isGroup: false,
      participants: { $all: [userId, targetUserId], $size: 2 },
    });

    if (!chat) {
      chat = await chatModel.create({
        isGroup: false,
        participants: [userId, targetUserId],
      });
    }

    chat = await chat.populate("participants", "fullname email profilePic location isOnboarded");

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Create a new Group Chat
export async function createGroupChat(req, res) {
  try {
    const userId = req.user.id;
    const { groupName, participants, groupPic } = req.body;

    if (!groupName || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ message: "Group name and participants array are required" });
    }

    const uniqueParticipants = Array.from(new Set([...participants, userId]));

    const chat = await chatModel.create({
      isGroup: true,
      groupName,
      groupPic: groupPic || `https://avatar.iran.liara.run/username?username=${encodeURIComponent(groupName)}`,
      participants: uniqueParticipants,
      admins: [userId],
    });

    const populatedChat = await chat.populate("participants", "fullname email profilePic location isOnboarded");

    const io = getIO();
    if (io) {
      uniqueParticipants.forEach((memberId) => {
        io.to(memberId.toString()).emit("group:created", populatedChat);
      });
    }

    res.status(201).json({ success: true, chat: populatedChat });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update Group Chat Details (Only Admins)
export async function updateGroup(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { groupName, groupPic } = req.body;

    const chat = await chatModel.findById(chatId);
    if (!chat || !chat.isGroup) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    if (!chat.admins.map((id) => id.toString()).includes(userId)) {
      return res.status(403).json({ message: "Only group admins can modify group settings" });
    }

    if (groupName) chat.groupName = groupName;
    if (groupPic) chat.groupPic = groupPic;

    await chat.save();
    const populatedChat = await chat.populate("participants", "fullname email profilePic location isOnboarded");

    const io = getIO();
    if (io) {
      io.to(chatId).emit("group:updated", populatedChat);
    }

    res.status(200).json({ success: true, chat: populatedChat });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete Group Chat (Only Admins)
export async function deleteGroup(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await chatModel.findById(chatId);
    if (!chat || !chat.isGroup) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    if (!chat.admins.map((id) => id.toString()).includes(userId)) {
      return res.status(403).json({ message: "Only group admins can delete groups" });
    }

    await messageModel.deleteMany({ chat: chatId });
    
    const io = getIO();
    if (io) {
      io.to(chatId).emit("group:deleted", { chatId });
    }

    await chatModel.findByIdAndDelete(chatId);

    res.status(200).json({ success: true, message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Add Participants to Group
export async function addGroupParticipants(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { newParticipants } = req.body;

    if (!newParticipants || !Array.isArray(newParticipants)) {
      return res.status(400).json({ message: "newParticipants array is required" });
    }

    const chat = await chatModel.findById(chatId);
    if (!chat || !chat.isGroup) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    if (!chat.participants.map((id) => id.toString()).includes(userId)) {
      return res.status(403).json({ message: "You must be a group member to invite users" });
    }

    const updatedParticipants = Array.from(
      new Set([...chat.participants.map(p => p.toString()), ...newParticipants])
    );

    chat.participants = updatedParticipants;
    await chat.save();
    
    const populatedChat = await chat.populate("participants", "fullname email profilePic location isOnboarded");

    const io = getIO();
    if (io) {
      io.to(chatId).emit("group:updated", populatedChat);
      newParticipants.forEach((memberId) => {
        io.to(memberId).emit("group:created", populatedChat);
      });
    }

    res.status(200).json({ success: true, chat: populatedChat });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Remove Participant from Group or Leave Group
export async function removeGroupParticipant(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: "Participant ID is required" });
    }

    const chat = await chatModel.findById(chatId);
    if (!chat || !chat.isGroup) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    const isAdmin = chat.admins.map((id) => id.toString()).includes(userId);
    const isSelfLeaving = userId === participantId;

    if (!isAdmin && !isSelfLeaving) {
      return res.status(403).json({ message: "Unauthorized to remove participant" });
    }

    chat.participants = chat.participants.filter((p) => p.toString() !== participantId);
    chat.admins = chat.admins.filter((a) => a.toString() !== participantId);

    if (chat.participants.length === 0) {
      await messageModel.deleteMany({ chat: chatId });
      await chatModel.findByIdAndDelete(chatId);
      return res.status(200).json({ success: true, message: "Last user left, group deleted" });
    }

    if (chat.admins.length === 0 && chat.participants.length > 0) {
      chat.admins.push(chat.participants[0]);
    }

    await chat.save();
    const populatedChat = await chat.populate("participants", "fullname email profilePic location isOnboarded");

    const io = getIO();
    if (io) {
      io.to(chatId).emit("group:updated", populatedChat);
      io.to(participantId).emit("group:removed", { chatId });
    }

    res.status(200).json({ success: true, chat: populatedChat });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get Group Info for Invite Link
export async function getGroupInviteInfo(req, res) {
  try {
    const { chatId } = req.params;
    const chat = await chatModel.findById(chatId).select("groupName groupPic participants isGroup");
    if (!chat || !chat.isGroup) {
      return res.status(404).json({ message: "Group chat not found" });
    }
    res.status(200).json({
      success: true,
      groupName: chat.groupName,
      groupPic: chat.groupPic,
      memberCount: chat.participants.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Join Group Via Invite Link
export async function joinGroupViaLink(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await chatModel.findById(chatId);
    if (!chat || !chat.isGroup) {
      return res.status(404).json({ message: "Group chat not found or invalid link" });
    }

    // Add user
    const updatedParticipants = Array.from(
      new Set([...chat.participants.map(p => p.toString()), userId])
    );
    chat.participants = updatedParticipants;
    await chat.save();

    const populatedChat = await chat.populate("participants", "fullname email profilePic location isOnboarded");

    const io = getIO();
    if (io) {
      io.to(chatId).emit("group:updated", populatedChat);
      io.to(userId).emit("group:created", populatedChat);
    }

    res.status(200).json({ success: true, chat: populatedChat });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Fetch messages for a specific chat room
export async function getChatMessages(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await chatModel.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      return res.status(403).json({ message: "Unauthorized access to chat" });
    }

    const messages = await messageModel
      .find({ chat: chatId })
      .populate("sender", "fullname profilePic email")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Send a Message in a chat room
export async function sendMessage(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const {
      content,
      fileUrl,
      fileType,
      location,
      pollQuestion,
      pollOptions,
      eventDetails,
    } = req.body;

    const chat = await chatModel.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      return res.status(403).json({ message: "Unauthorized access to chat" });
    }

    const message = await messageModel.create({
      chat: chatId,
      sender: userId,
      content: content || "",
      fileUrl: fileUrl || "",
      fileType: fileType || "",
      location,
      pollQuestion,
      pollOptions: pollOptions ? pollOptions.map((opt) => ({ optionText: opt, votes: [] })) : [],
      eventDetails,
      seenBy: [{ userId, seenAt: new Date() }],
    });

    chat.lastMessage = message._id;
    await chat.save();

    const populatedMessage = await message.populate("sender", "fullname profilePic email");

    const io = getIO();
    if (io) {
      io.to(chatId).emit("message:receive", populatedMessage);
      
      chat.participants.forEach((participantId) => {
        if (participantId.toString() !== userId.toString()) {
          io.to(participantId.toString()).emit("message:notification", {
            chatId,
            message: populatedMessage,
          });
        }
      });
    }

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Mark messages as seen in a chat room
export async function markChatAsSeen(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await chatModel.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      return res.status(403).json({ message: "Unauthorized access to chat" });
    }

    await messageModel.updateMany(
      { chat: chatId, "seenBy.userId": { $ne: userId } },
      { $addToSet: { seenBy: { userId, seenAt: new Date() } } }
    );

    const io = getIO();
    if (io) {
      io.to(chatId).emit("message:seen", { chatId, userId });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Vote on a Poll Option inside a Message
export async function votePoll(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    const { optionId } = req.body;

    if (!optionId) {
      return res.status(400).json({ message: "Option ID is required to vote" });
    }

    const message = await messageModel.findById(messageId);
    if (!message || message.fileType !== "poll") {
      return res.status(404).json({ message: "Poll message not found" });
    }

    const chat = await chatModel.findOne({ _id: message.chat, participants: userId });
    if (!chat) {
      return res.status(403).json({ message: "Unauthorized access to poll" });
    }

    message.pollOptions.forEach((opt) => {
      const isSelectedOption = opt._id.toString() === optionId;
      const userIndex = opt.votes.indexOf(userId);

      if (isSelectedOption) {
        if (userIndex === -1) {
          opt.votes.push(userId);
        } else {
          opt.votes.splice(userIndex, 1);
        }
      } else {
        const otherIndex = opt.votes.indexOf(userId);
        if (otherIndex !== -1) {
          opt.votes.splice(otherIndex, 1);
        }
      }
    });

    await message.save();
    
    const populatedMessage = await message.populate("sender", "fullname profilePic email");

    const io = getIO();
    if (io) {
      io.to(message.chat.toString()).emit("poll:vote", {
        messageId: message._id,
        pollOptions: message.pollOptions,
      });
    }

    res.status(200).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Edit a chat message (Only Sender)
export async function editMessage(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Updated content is required" });
    }

    const message = await messageModel.findById(messageId);
    if (!message || message.isDeleted) {
      return res.status(404).json({ message: "Message not found or already deleted" });
    }

    // Verify sender matches requesting user
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to edit this message" });
    }

    message.content = content.trim();
    message.isEdited = true;
    await message.save();

    const populatedMessage = await message.populate("sender", "fullname profilePic email");

    // Emit event via Socket.IO
    const io = getIO();
    if (io) {
      io.to(message.chat.toString()).emit("message:update", populatedMessage);
    }

    res.status(200).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete a chat message (Only Sender)
export async function deleteMessage(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await messageModel.findById(messageId);
    if (!message || message.isDeleted) {
      return res.status(404).json({ message: "Message not found or already deleted" });
    }

    // Verify sender matches requesting user
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this message" });
    }

    // Flag as deleted and clear contents
    message.isDeleted = true;
    message.content = "This message was deleted";
    message.fileUrl = "";
    message.fileType = "";
    message.location = undefined;
    message.pollQuestion = "";
    message.pollOptions = [];
    message.eventDetails = undefined;
    await message.save();

    const populatedMessage = await message.populate("sender", "fullname profilePic email");

    // Emit delete event via Socket.IO
    const io = getIO();
    if (io) {
      io.to(message.chat.toString()).emit("message:delete", { messageId: message._id });
    }

    res.status(200).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
