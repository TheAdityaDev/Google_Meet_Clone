import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { useSocket } from "../context/SocketContext";
import {
  getOrCreateDirectChat,
  getChatMessages,
  sendChatMessage,
  markChatAsSeen,
  getUserChats,
  voteOnPoll,
  editChatMessage,
  deleteChatMessage,
} from "../lib/api";
import {
  Video,
  Send,
  Image as ImageIcon,
  ArrowLeft,
  Smile,
  Check,
  CheckCheck,
  MoreVertical,
  Plus,
  MapPin,
  FileText,
  BarChart2,
  Calendar,
  Mic,
  Square,
  Volume2,
  Globe,
  Settings,
  X,
  Play,
  Pause,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";
import GroupSettingsModal from "../components/GroupSettingsModal";

// Language translation options
const TRANSLATION_LANGUAGES = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  hi: "Hindi",
  ja: "Japanese",
};

// Client-side translation mocks (for demo)
const TRANSLATION_MOCKS = {
  en: {
    hello: "Hello",
    hi: "Hi",
    how: "How are you?",
    good: "Good morning",
    yes: "Yes",
    no: "No",
    call: "Join the video call here",
  },
  es: {
    hello: "Hola",
    hi: "Hola",
    how: "¿Cómo estás?",
    good: "Buenos días",
    yes: "Sí",
    no: "No",
    call: "Únete a la videollamada aquí",
  },
  fr: {
    hello: "Bonjour",
    hi: "Salut",
    how: "Comment ça va?",
    good: "Bon matin",
    yes: "Oui",
    no: "Non",
    call: "Rejoignez l'appel vidéo ici",
  },
  de: {
    hello: "Hallo",
    hi: "Hallo",
    how: "Wie geht es dir?",
    good: "Guten Morgen",
    yes: "Ja",
    no: "Nein",
    call: "Treten Sie hier dem Videoanruf bei",
  },
  hi: {
    hello: "नमस्ते",
    hi: "नमस्ते",
    how: "आप कैसे हैं?",
    good: "शुभ प्रभात",
    yes: "हाँ",
    no: "नहीं",
    call: "यहाँ वीडियो कॉल में शामिल हों",
  },
  ja: {
    hello: "こんにちは",
    hi: "やあ",
    how: "元気ですか？",
    good: "おはようございます",
    yes: "はい",
    no: "いいえ",
    call: "ここでビデオ通話に参加します",
  },
};

const ChatPage = () => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authUserData } = useAuthUser();
  const { socket, onlineUsers } = useSocket();

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals & Menu States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Message Edit states
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Audio Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // Poll Form State
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // Event Form State
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  // Translation state
  const [translatedMessages, setTranslatedMessages] = useState({}); // { msgId: { langCode: text } }
  const [activeAudioId, setActiveAudioId] = useState(null); // Tracks currently playing voice note ID

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const recordIntervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Dynamic DM/Group Chat lookup
  const { data: chatsResponse } = useQuery({
    queryKey: ["userChats"],
    queryFn: getUserChats,
    enabled: !!authUserData,
  });

  const chats = chatsResponse?.chats || [];
  const matchedChat = chats.find((c) => c._id === routeId);
  const isGroupChat = matchedChat?.isGroup;

  // If DM chat, lookup target friend. If not in list, trigger direct chat lookup
  const targetUserId = isGroupChat ? null : routeId;

  const { data: directChatData } = useQuery({
    queryKey: ["directChat", targetUserId],
    queryFn: () => getOrCreateDirectChat(targetUserId),
    enabled: !!targetUserId && !!authUserData && !matchedChat,
  });

  const chatId = matchedChat?._id || directChatData?.chat?._id;

  // Message History
  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: () => getChatMessages(chatId),
    enabled: !!chatId,
  });

  useEffect(() => {
    if (matchedChat) {
      setChat(matchedChat);
    } else if (directChatData?.chat) {
      setChat(directChatData.chat);
    }
  }, [matchedChat, directChatData]);

  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages);
      setLoading(false);
      if (chatId) {
        markChatAsSeen(chatId).catch(() => {});
      }
    }
  }, [messagesData, chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPeerTyping]);

  // Socket Connection and Event Handling
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit("chat:join", chatId);

    socket.on("message:receive", (message) => {
      if (message.chat === chatId) {
        setMessages((prev) => [...prev, message]);
        markChatAsSeen(chatId).catch(() => {});
      }
    });

    socket.on("typing:start", (data) => {
      if (isGroupChat) return; // Typing indicators for groups skipped for simplicity
      if (data.senderId === targetUserId) {
        setIsPeerTyping(true);
      }
    });

    socket.on("typing:stop", (data) => {
      if (data.senderId === targetUserId) {
        setIsPeerTyping(false);
      }
    });

    socket.on("message:seen", ({ userId: seerId }) => {
      if (seerId === targetUserId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.sender._id === authUserData?._id) {
              const alreadySeen = msg.seenBy.some((s) => s.userId === seerId);
              if (!alreadySeen) {
                return {
                  ...msg,
                  seenBy: [
                    ...msg.seenBy,
                    { userId: seerId, seenAt: new Date() },
                  ],
                };
              }
            }
            return msg;
          }),
        );
      }
    });

    // Real-time Poll updates
    socket.on("poll:vote", ({ messageId, pollOptions: updatedOptions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, pollOptions: updatedOptions } : msg,
        ),
      );
    });

    // Real-time Message Updates (Edits)
    socket.on("message:update", (updatedMessage) => {
      if (updatedMessage.chat === chatId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg,
          ),
        );
      }
    });

    // Real-time Message Deletes
    socket.on("message:delete", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                isDeleted: true,
                content: "This message was deleted",
                fileUrl: "",
                fileType: "",
                pollQuestion: "",
                pollOptions: [],
                eventDetails: undefined,
              }
            : msg,
        ),
      );
    });

    // Real-time Group updates
    socket.on("group:updated", (updatedGroup) => {
      if (updatedGroup._id === chatId) {
        setChat(updatedGroup);
        queryClient.invalidateQueries({ queryKey: ["userChats"] });
      }
    });

    socket.on("group:deleted", ({ chatId: delChatId }) => {
      if (delChatId === chatId) {
        toast.error("This group has been deleted by the admin");
        navigate("/");
      }
    });

    socket.on("group:removed", ({ chatId: remChatId }) => {
      if (remChatId === chatId) {
        toast.error("You have been removed from this group");
        navigate("/");
      }
    });

    return () => {
      socket.emit("chat:leave", chatId);
      socket.off("message:receive");
      socket.off("typing:start");
      socket.off("typing:stop");
      socket.off("message:seen");
      socket.off("poll:vote");
      socket.off("message:update");
      socket.off("message:delete");
      socket.off("group:updated");
      socket.off("group:deleted");
      socket.off("group:removed");
    };
  }, [socket, chatId, targetUserId, authUserData?._id, isGroupChat]);

  // Handle typing triggers
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!socket || !chatId || isGroupChat) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing:start", {
        chatId,
        senderId: authUserData?._id,
        receiverId: targetUserId,
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typing:stop", {
        chatId,
        senderId: authUserData?._id,
        receiverId: targetUserId,
      });
    }, 2000);
  };

  // Send Message Rest
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !chatId) return;

    const messageContent = inputText;
    setInputText("");

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    if (!isGroupChat) {
      socket.emit("typing:stop", {
        chatId,
        senderId: authUserData?._id,
        receiverId: targetUserId,
      });
    }

    try {
      await sendChatMessage(chatId, { content: messageContent });
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  // Edit message submit
  const handleEditSubmit = async (messageId) => {
    if (!editingText.trim()) return;
    try {
      await editChatMessage(messageId, editingText.trim());
      setEditingMessageId(null);
      setEditingText("");
      toast.success("Message updated");
    } catch (error) {
      toast.error("Failed to edit message");
    }
  };

  // Delete message click
  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteChatMessage(messageId);
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  // Voice recording triggers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        setAudioChunks(chunks);
        handleSendVoiceNote(chunks);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordIntervalRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.onstop = null; // Prevent sending
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordIntervalRef.current);
      setAudioChunks([]);
      toast.error("Recording canceled");
    }
  };

  const handleSendVoiceNote = (chunks) => {
    const audioBlob = new Blob(chunks, { type: "audio/webm" });
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result;
      try {
        await sendChatMessage(chatId, {
          fileUrl: base64Audio,
          fileType: "audio",
          content: "Voice Note",
        });
      } catch (err) {
        toast.error("Failed to send voice note");
      }
    };
  };

  // File uploading conversion to base64
  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        await sendChatMessage(chatId, {
          fileUrl: reader.result,
          fileType: type,
          content: file.name,
        });
        toast.success(`${type} shared successfully`);
      } catch (err) {
        toast.error(`Failed to send ${type}`);
      }
    };
    setIsAttachmentOpen(false);
  };

  // Share Location
  const shareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await sendChatMessage(chatId, {
            fileType: "location",
            content: "Location Pin",
            location: {
              latitude,
              longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            },
          });
          toast.success("Location shared successfully");
        } catch (err) {
          toast.error("Failed to share location");
        }
      },
      () => {
        toast.error("Unable to retrieve location");
      },
    );
    setIsAttachmentOpen(false);
  };

  // Create Poll Submit
  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const activeOptions = pollOptions.filter((opt) => opt.trim() !== "");
    if (!pollQuestion.trim() || activeOptions.length < 2) {
      toast.error("Poll question and at least 2 options are required");
      return;
    }

    try {
      await sendChatMessage(chatId, {
        fileType: "poll",
        pollQuestion: pollQuestion.trim(),
        pollOptions: activeOptions,
        content: `Poll: ${pollQuestion.trim()}`,
      });
      setPollQuestion("");
      setPollOptions(["", ""]);
      setIsPollModalOpen(false);
      toast.success("Poll shared!");
    } catch (err) {
      toast.error("Failed to create poll");
    }
  };

  // Create Event Submit
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate || !eventTime) {
      toast.error("Event title, date, and time are required");
      return;
    }

    try {
      await sendChatMessage(chatId, {
        fileType: "event",
        eventDetails: {
          title: eventTitle.trim(),
          description: eventDesc.trim(),
          date: eventDate,
          time: eventTime,
        },
        content: `Event Invite: ${eventTitle.trim()}`,
      });
      setEventTitle("");
      setEventDesc("");
      setEventDate("");
      setEventTime("");
      setIsEventModalOpen(false);
      toast.success("Event created!");
    } catch (err) {
      toast.error("Failed to create event");
    }
  };

  // Poll Vote action
  const handleVote = async (messageId, optionId) => {
    try {
      await voteOnPoll(messageId, optionId);
    } catch (err) {
      toast.error("Failed to submit vote");
    }
  };

  // Translate messages
  const handleTranslateMessage = (messageId, contentText, targetLangCode) => {
    // Smart translator mock: Look if message contains keys in dictionary
    const cleanWord = contentText
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .trim();
    let translated = "";

    // Exact mapping or fallbacks
    if (TRANSLATION_MOCKS[targetLangCode]) {
      const langDict = TRANSLATION_MOCKS[targetLangCode];
      if (
        cleanWord.includes("hello") ||
        cleanWord.includes("hola") ||
        cleanWord.includes("bonjour") ||
        cleanWord.includes("नमस्ते")
      ) {
        translated = langDict.hello;
      } else if (cleanWord.includes("hi")) {
        translated = langDict.hi;
      } else if (cleanWord.includes("how")) {
        translated = langDict.how;
      } else if (cleanWord.includes("good")) {
        translated = langDict.good;
      } else if (cleanWord.includes("yes")) {
        translated = langDict.yes;
      } else if (cleanWord.includes("no")) {
        translated = langDict.no;
      } else if (
        cleanWord.includes("video call") ||
        cleanWord.includes("call")
      ) {
        translated = langDict.call;
      } else {
        // Fallback: Mock Translate effect (reversing or appending letters)
        translated = `[Translated to ${TRANSLATION_LANGUAGES[targetLangCode]}]: ${contentText}`;
      }
    } else {
      translated = `[Translated]: ${contentText}`;
    }

    setTranslatedMessages((prev) => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [targetLangCode]: translated,
      },
    }));
  };

  const handleVideoCall = () => {
    if (!chatId) return;
    const isOnline = isGroupChat ? false : onlineUsers.includes(targetUserId);
    if (!isOnline && !isGroupChat) {
      toast.error("Friend is offline. Call cannot be completed.");
      return;
    }
    navigate(`/call/${chatId}?peerId=${targetUserId}`);
  };

  // Audio note rendering helper
  const renderAudioWave = (audioId) => {
    const isPlaying = activeAudioId === audioId;
    return (
      <div className="flex items-center gap-1 h-5 mt-2 px-2 bg-slate-950/20 py-1.5 rounded-lg w-full max-w-[200px]">
        {[...Array(12)].map((_, i) => {
          const heightClass = [
            "h-2",
            "h-4",
            "h-3",
            "h-5",
            "h-2",
            "h-4",
            "h-3",
            "h-5",
            "h-2",
            "h-3",
            "h-4",
            "h-1",
          ][i % 12];
          return (
            <span
              key={i}
              className={`w-0.5 ${heightClass} bg-indigo-400 rounded-full transition-transform ${
                isPlaying ? "animate-pulse origin-bottom" : ""
              }`}
              style={{
                animationDelay: isPlaying ? `${i * 0.1}s` : "0s",
                transform: isPlaying ? "scaleY(1.4)" : "scaleY(1)",
              }}
            />
          );
        })}
      </div>
    );
  };

  // Audio play state updater
  const handleAudioPlay = (audioId, audioRef) => {
    if (audioRef) {
      if (activeAudioId === audioId) {
        audioRef.pause();
        setActiveAudioId(null);
      } else {
        audioRef.play();
        setActiveAudioId(audioId);
        audioRef.onended = () => setActiveAudioId(null);
      }
    }
  };

  if (loading || loadingMessages || !chat) {
    return (
      <div className="h-[90vh] flex items-center justify-center bg-slate-950">
        <span className="loading loading-ring loading-lg text-primary"></span>
      </div>
    );
  }

  const friendUser = isGroupChat
    ? null
    : chat.participants.find((p) => p._id !== authUserData?._id);
  const isOnline = isGroupChat
    ? false
    : friendUser
      ? onlineUsers.includes(friendUser._id)
      : false;

  return (
    <div className="flex flex-col h-[91vh] bg-slate-950 text-slate-100 relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="btn btn-ghost btn-circle btn-sm lg:hidden text-slate-300"
          >
            <ArrowLeft className="size-5" />
          </button>

          <div className="relative">
            {isGroupChat ? (
              <div className="avatar placeholder">
                <div className="w-10 h-10 rounded-full bg-slate-800 ring-2 ring-indigo-500/50 text-slate-200">
                  <span>{chat.groupName?.substring(0, 2).toUpperCase()}</span>
                </div>
              </div>
            ) : (
              <div className={`avatar ${isOnline ? "online" : "offline"}`}>
                <div className="w-10 h-10 rounded-full ring-2 ring-indigo-500/50">
                  <img
                    src={friendUser?.profilePic}
                    alt={friendUser?.fullname}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-base md:text-lg text-slate-100 truncate max-w-[150px] sm:max-w-xs">
              {isGroupChat ? chat.groupName : friendUser?.fullname}
            </h2>
            <p className="text-xs text-slate-400">
              {isGroupChat ? (
                `${chat.participants?.length || 0} members`
              ) : isOnline ? (
                <span className="text-emerald-400 font-medium">Online</span>
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isGroupChat && isOnline && (
            <button
              onClick={handleVideoCall}
              className="btn btn-circle btn-success text-white btn-sm md:btn-md shadow-lg"
              title="Start Video Call"
            >
              <Video className="size-4 md:size-5" />
            </button>
          )}

          {isGroupChat && (
            <>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="btn btn-ghost btn-circle btn-sm text-slate-300 hover:text-primary transition-colors"
                title="Share / Invite Link"
              >
                <Share2 className="size-5" />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="btn btn-ghost btn-circle btn-sm text-slate-300"
                title="Group Settings"
              >
                <Settings className="size-5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Messages Listing */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(91vh-140px)] bg-slate-950/80">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Smile className="size-16 animate-pulse text-indigo-500" />
            <p className="text-lg font-semibold text-slate-300">
              Start the conversation
            </p>
            <p className="text-sm text-slate-500">
              Send an emoji, file, location, or voice note.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender._id === authUserData?._id;
            const msgTime = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isSeen = isGroupChat
              ? msg.seenBy?.length > 1
              : msg.seenBy?.some((s) => s.userId === targetUserId);

            // Fetch translated version if generated
            const messageTranslation = translatedMessages[msg._id];

            return (
              <div
                key={msg._id || index}
                className={`chat ${isMe ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-image avatar">
                  <div className="w-8 rounded-full border border-slate-800">
                    <img
                      src={
                        isMe ? authUserData?.profilePic : msg.sender.profilePic
                      }
                      alt="Avatar"
                    />
                  </div>
                </div>

                {/* <div className="chat-header text-xs opacity-50 mb-1 text-slate-400">
                  {isMe ? "You" : msg.sender.fullname}
                </div> */}

                {/* Message Bubble wrapper */}
                {/* Message Bubble wrapper */}
                <div className="relative group max-w-xs md:max-w-md">
                  <div
                    className={`chat-bubble
                        max-w-[280px]
                        sm:max-w-md
                        lg:max-w-lg
                        p-3
                        rounded-2xl
                        break-words
                    ${
                      isMe
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                        : "bg-slate-900 border border-slate-800 text-slate-100"
                    }
`}
                  >
                    {msg.isDeleted ? (
                      <p className="italic text-slate-400 text-sm">
                        This message was deleted
                      </p>
                    ) : editingMessageId === msg._id ? (
                      <div className="flex flex-col gap-2 w-48 sm:w-64">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="input input-bordered input-xs bg-slate-950 text-white w-full text-sm border-indigo-500 focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSubmit(msg._id);
                            if (e.key === "Escape") setEditingMessageId(null);
                          }}
                        />
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setEditingMessageId(null)}
                            className="btn btn-ghost btn-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditSubmit(msg._id)}
                            className="btn btn-primary btn-xs text-white"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Render different file types */}
                        {msg.fileType === "image" && (
                          <div className="space-y-1">
                            <img
                              src={msg.fileUrl}
                              alt="shared pic"
                              className="rounded-lg max-h-60 object-cover w-full cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(msg.fileUrl)}
                            />
                            {msg.content && msg.content !== "Image" && (
                              <p className="text-sm">{msg.content}</p>
                            )}
                          </div>
                        )}

                        {msg.fileType === "file" && (
                          <a
                            href={msg.fileUrl}
                            download={msg.content}
                            className="flex items-center gap-2.5 p-2 bg-slate-950/40 rounded-xl hover:bg-slate-950/60 transition-colors"
                          >
                            <FileText className="size-8 text-indigo-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate text-slate-200">
                                {msg.content}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Click to download
                              </p>
                            </div>
                          </a>
                        )}

                        {msg.fileType === "audio" && (
                          <div className="flex flex-col w-48 sm:w-60">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const audioEl = document.getElementById(
                                    `audio-${msg._id}`,
                                  );
                                  handleAudioPlay(msg._id, audioEl);
                                }}
                                className="btn btn-circle btn-xs btn-primary text-white"
                              >
                                {activeAudioId === msg._id ? (
                                  <Pause className="size-3" />
                                ) : (
                                  <Play className="size-3 pl-0.5" />
                                )}
                              </button>
                              <span className="text-xs text-slate-300 font-medium">
                                Voice Note
                              </span>
                              <audio
                                id={`audio-${msg._id}`}
                                src={msg.fileUrl}
                                className="hidden"
                              />
                            </div>
                            {renderAudioWave(msg._id)}
                          </div>
                        )}

                        {msg.fileType === "location" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="size-5 text-rose-500 animate-bounce" />
                              <span className="font-semibold text-sm">
                                Location Shared
                              </span>
                            </div>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${msg.location.latitude},${msg.location.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-xs btn-primary text-white w-full"
                            >
                              View on Maps
                            </a>
                          </div>
                        )}

                        {msg.fileType === "poll" && (
                          <div className="space-y-3 w-56 sm:w-72">
                            <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                              <BarChart2 className="size-5 text-indigo-400" />
                              <span className="font-bold text-sm text-slate-200">
                                {msg.pollQuestion}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {msg.pollOptions.map((opt) => {
                                const totalVotes = msg.pollOptions.reduce(
                                  (acc, o) => acc + o.votes.length,
                                  0,
                                );
                                const percent =
                                  totalVotes > 0
                                    ? (opt.votes.length / totalVotes) * 100
                                    : 0;
                                const hasVoted = opt.votes.includes(
                                  authUserData?._id,
                                );

                                return (
                                  <div
                                    key={opt._id}
                                    onClick={() =>
                                      !hasVoted && handleVote(msg._id, opt._id)
                                    }
                                    className={`relative overflow-hidden rounded-lg border p-3 cursor-pointer transition-all
                                    ${
                                      hasVoted === opt._id
                                        ? "border-green-500 bg-green-500/10"
                                        : "border-slate-800 bg-slate-950/40 hover:bg-slate-950/70"
                                    }
                                    ${hasVoted ? "cursor-default" : "cursor-pointer"}
                                  `}
                                  >
                                    {/* Progress Bar */}
                                    <div
                                      className="absolute inset-y-0 left-0 bg-indigo-500/20 transition-all duration-500"
                                      style={{ width: `${percent}%` }}
                                    />

                                    {/* Content */}
                                    <div className="relative z-10 flex items-center justify-between">
                                      <span className="font-medium text-slate-200">
                                        {opt.optionText}
                                      </span>

                                      <span className="text-xs text-slate-400">
                                        {opt.votes.length} votes (
                                        {percent.toFixed(0)}%)
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {msg.fileType === "event" && (
                          <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2.5 w-52 sm:w-64">
                            <div className="flex items-center gap-2">
                              <Calendar className="size-5 text-amber-500" />
                              <span className="font-bold text-sm text-slate-200">
                                {msg.eventDetails.title}
                              </span>
                            </div>
                            {msg.eventDetails.description && (
                              <p className="text-xs text-slate-400 italic break-words">
                                {msg.eventDetails.description}
                              </p>
                            )}
                            <div className="text-[10px] text-slate-300 flex justify-between bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/50">
                              <span>📅 {msg.eventDetails.date}</span>
                              <span>⏰ {msg.eventDetails.time}</span>
                            </div>
                          </div>
                        )}

                        {(!msg.fileType || msg.fileType === "") && (
                          <p className="break-words text-sm md:text-base leading-relaxed">
                            {msg.content}
                            {msg.isEdited && (
                              <span className="text-[10px] text-slate-400/60 ml-2 font-normal italic">
                                (edited)
                              </span>
                            )}
                          </p>
                        )}
                      </>
                    )}

                    {/* Show Translation below text */}
                    {!msg.isDeleted &&
                      messageTranslation &&
                      Object.keys(messageTranslation).map((code) => (
                        <div
                          key={code}
                          className="mt-2 pt-2 border-t border-slate-800/80 text-xs text-indigo-300 italic flex flex-col gap-0.5"
                        >
                          <span className="text-[9px] text-slate-500 not-italic uppercase font-semibold">
                            Translated ({TRANSLATION_LANGUAGES[code]}):
                          </span>
                          <span>{messageTranslation[code]}</span>
                        </div>
                      ))}
                  </div>

                  {/* Actions Hover Menu */}
                  {!msg.isDeleted && (
                    <div className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-10 px-2 right-full mr-2">
                      {/* Translate Globe */}
                      {(!msg.fileType ||
                        msg.fileType === "" ||
                        msg.fileType === "audio" ||
                        msg.fileType === "image") && (
                        <div className="dropdown dropdown-left">
                          <label
                            tabIndex={0}
                            className="btn btn-circle btn-xs btn-outline border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
                            title="Translate Message"
                          >
                            <Globe className="size-3" />
                          </label>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu p-1 shadow bg-slate-900 border border-slate-800 rounded-box w-28 text-[11px] divide-y divide-slate-800/50 z-20"
                          >
                            {Object.entries(TRANSLATION_LANGUAGES).map(
                              ([code, name]) => (
                                <li key={code}>
                                  <button
                                    onClick={() =>
                                      handleTranslateMessage(
                                        msg._id,
                                        msg.content,
                                        code,
                                      )
                                    }
                                    className="px-2 py-1.5 text-left text-slate-200 hover:bg-slate-800 rounded-md"
                                  >
                                    {name}
                                  </button>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Edit (only text) & Delete (all) for Sender only */}
                      {isMe && (
                        <>
                          {(!msg.fileType || msg.fileType === "") && (
                            <button
                              onClick={() => {
                                setEditingMessageId(msg._id);
                                setEditingText(msg.content);
                              }}
                              className="btn btn-circle btn-xs btn-outline border-slate-800 bg-slate-900 text-indigo-400 hover:bg-slate-800 hover:text-indigo-300"
                              title="Edit Message"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msg._id)}
                            className="btn btn-circle btn-xs btn-outline border-slate-800 bg-slate-900 text-rose-500 hover:bg-slate-800 hover:text-rose-400"
                            title="Delete Message"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="chat-footer opacity-70 text-xs mt-1 flex items-center gap-1.5 justify-end text-slate-500">
                  <span>{msgTime}</span>
                  {isMe && (
                    <span>
                      {isSeen ? (
                        <CheckCheck className="size-4 text-sky-400" />
                      ) : (
                        <Check className="size-4 text-slate-600" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isPeerTyping && (
          <div className="chat chat-start animate-pulse">
            <div className="chat-image avatar">
              <div className="w-8 rounded-full border border-slate-800">
                <img src={friendUser?.profilePic} alt="Avatar" />
              </div>
            </div>
            <div className="chat-bubble bg-slate-900 border border-slate-800 text-slate-400 p-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input / Attachment / Recording Toolbar Footer */}
      <footer className="p-4 bg-slate-900 border-t border-slate-800 z-10">
        {/* Recording Overlay */}
        {isRecording ? (
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-full border border-slate-800 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3 pl-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-sm font-semibold text-slate-300">
                Recording: {Math.floor(recordingTime / 60)}:
                {(recordingTime % 60).toString().padStart(2, "0")}
              </span>
            </div>

            {/* Record Controls */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="btn btn-circle btn-ghost btn-sm text-slate-400 hover:text-slate-200"
                title="Cancel"
              >
                <X className="size-5" />
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="btn btn-circle btn-primary btn-sm text-white"
                title="Save & Send"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-w-7xl mx-auto w-full relative">
            {/* Attachments Dropdown Menu */}
            {isAttachmentOpen && (
              <div className="absolute bottom-16 left-0 bg-slate-950 border border-slate-800 p-2 rounded-2xl shadow-2xl flex flex-col gap-1 w-48 z-20">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-slate-900 rounded-xl text-sm transition-colors text-left"
                >
                  <ImageIcon className="size-4 text-emerald-400" /> Share Image
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-slate-900 rounded-xl text-sm transition-colors text-left"
                >
                  <FileText className="size-4 text-sky-400" /> Share File
                </button>
                <button
                  type="button"
                  onClick={shareLocation}
                  className="flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-slate-900 rounded-xl text-sm transition-colors text-left"
                >
                  <MapPin className="size-4 text-rose-400" /> Share Location
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAttachmentOpen(false);
                    setIsPollModalOpen(true);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-slate-900 rounded-xl text-sm transition-colors text-left"
                >
                  <BarChart2 className="size-4 text-indigo-400" /> Create Poll
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAttachmentOpen(false);
                    setIsEventModalOpen(true);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-slate-900 rounded-xl text-sm transition-colors text-left"
                >
                  <Calendar className="size-4 text-amber-400" /> Create Event
                </button>

                {/* Hidden File Selectors */}
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*,video/*"
                  onChange={(e) => handleFileUpload(e, "image")}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="*"
                  onChange={(e) => handleFileUpload(e, "file")}
                  className="hidden"
                />
              </div>
            )}

            {/* Input form element */}
            <form
              onSubmit={handleSendMessage}
              className="flex gap-2 items-center"
            >
              {/* Expand Attachments "+" button */}
              <button
                type="button"
                onClick={() => setIsAttachmentOpen(!isAttachmentOpen)}
                className={`btn btn-circle btn-sm md:btn-md border-0 transition-transform ${
                  isAttachmentOpen
                    ? "bg-slate-800 text-white rotate-45"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Plus className="size-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="input input-bordered flex-1 rounded-full text-base bg-slate-950 border-0 outline-none text-slate-200 pl-4 h-10 md:h-12 focus:ring-1 focus:ring-indigo-500"
              />

              {/* Conditionally show Send or Mic button */}
              {inputText.trim() ? (
                <button
                  type="submit"
                  className="btn btn-circle btn-primary btn-sm md:btn-md text-white shadow-lg"
                >
                  <Send className="size-4 md:size-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="btn btn-circle btn-secondary btn-sm md:btn-md text-white shadow-lg bg-indigo-500 hover:bg-indigo-600 border-0"
                  title="Record Voice Note"
                >
                  <Mic className="size-4 md:size-5" />
                </button>
              )}
            </form>
          </div>
        )}
      </footer>

      {/* CREATE POLL MODAL */}
      {isPollModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 flex items-center gap-1.5">
                <BarChart2 className="size-5 text-indigo-400" /> Create Poll
              </h3>
              <button
                onClick={() => setIsPollModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div className="form-control">
                <label className="label-text text-slate-400 text-xs mb-1">
                  Question
                </label>
                <input
                  type="text"
                  placeholder="Ask something..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="input input-bordered bg-slate-950 border-slate-800 text-slate-200 text-sm h-10 w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="label-text text-slate-400 text-xs">
                  Options
                </label>
                {pollOptions.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...pollOptions];
                      updated[i] = e.target.value;
                      setPollOptions(updated);
                    }}
                    className="input input-bordered bg-slate-950 border-slate-800 text-slate-200 text-xs h-9 w-full"
                    required={i < 2}
                  />
                ))}

                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="text-[10px] text-indigo-400 hover:underline pt-0.5"
                  >
                    + Add option
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm text-white w-full"
              >
                Share Poll
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 flex items-center gap-1.5">
                <Calendar className="size-5 text-amber-400" /> Create Event
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div className="form-control">
                <label className="label-text text-slate-400 text-xs mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Project Review"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="input input-bordered bg-slate-950 border-slate-800 text-slate-200 text-sm h-10 w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label-text text-slate-400 text-xs mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Add details..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="textarea textarea-bordered bg-slate-950 border-slate-800 text-slate-200 text-xs h-16 w-full resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="form-control">
                  <label className="label-text text-slate-400 text-xs mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="input input-bordered bg-slate-950 border-slate-800 text-slate-200 text-xs h-9 w-full"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label-text text-slate-400 text-xs mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="input input-bordered bg-slate-950 border-slate-800 text-slate-200 text-xs h-9 w-full"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm text-white w-full pt-2"
              >
                Share Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GROUP SETTINGS MODAL */}
      <GroupSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        chat={chat}
        onGroupUpdated={(updatedChat) => {
          setChat(updatedChat);
          queryClient.invalidateQueries({ queryKey: ["chatMessages", chatId] });
        }}
        onGroupDeleted={() => navigate("/")}
      />

      {/* GROUP INVITE / SHARE LINK MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 flex items-center gap-1.5">
                <Share2 className="size-5 text-indigo-400" /> Share Invitation
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 flex flex-col items-center">
              <p className="text-xs text-slate-400 text-center">
                Share this link or QR code with friends to let them join this
                group chat.
              </p>

              {/* QR Code Container */}
              <div className="p-3 bg-white rounded-xl shadow-inner flex items-center justify-center border border-slate-800/10">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/join/group/${chatId}`)}`}
                  alt="Group QR Code"
                  className="w-[150px] h-[150px]"
                />
              </div>

              {/* Copy Join Link Input */}
              <div className="form-control w-full">
                <label className="label-text text-slate-400 text-xs mb-1">
                  Invite Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/join/group/${chatId}`}
                    className="input input-bordered bg-slate-950 border-slate-800 text-slate-200 text-xs h-9 flex-1 select-all font-semibold"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/join/group/${chatId}`,
                      );
                      toast.success("Invite link copied to clipboard!");
                    }}
                    className="btn btn-primary btn-sm text-white px-3"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
