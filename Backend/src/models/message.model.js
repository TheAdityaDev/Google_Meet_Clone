import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      default: "", // "image", "file", "audio" (voice notes), "location", "poll", "event"
    },
    // Location Details
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    // Poll Details
    pollQuestion: {
      type: String,
      default: "",
    },
    pollOptions: [
      {
        optionText: { type: String, required: true },
        votes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
          },
        ],
      },
    ],
    // Event Details
    eventDetails: {
      title: String,
      description: String,
      date: String,
      time: String,
    },
    // Edit / Delete status flags
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    seenBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        seenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    deliveredTo: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        deliveredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const messageModel = mongoose.model("message", messageSchema);
export default messageModel;
