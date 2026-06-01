import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useSocket } from "../context/SocketContext";
import useAuthUser from "../hooks/useAuthUser";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  User,
  Volume2,
} from "lucide-react";
import toast from "react-hot-toast";

const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

const CallPage = () => {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { socket, incomingCall, setIncomingCall } = useSocket();
  const { authUserData } = useAuthUser();

  // Search parameters for role / peerId
  const searchParams = new URLSearchParams(location.search);
  const peerId = searchParams.get("peerId");
  const isIncoming = searchParams.get("incoming") === "true";

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState("Connecting...");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  // Initialize Media Devices & WebRTC
  useEffect(() => {
    if (!socket || !authUserData || !peerId) {
      toast.error("Invalid call configuration");
      navigate("/");
      return;
    }

    const startCall = async () => {
      try {
        setCallStatus("Accessing media devices...");
        
        // 1. Get Camera/Mic streams
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        setLocalStream(stream);
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Initialize RTCPeerConnection
        const pc = new RTCPeerConnection(iceServers);
        pcRef.current = pc;

        // Add local tracks to PeerConnection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream tracks
        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
            setCallStatus("Connected");
          }
        };

        // ICE Candidate gathering
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("webrtc:signal", {
              recipientId: peerId,
              signal: { type: "candidate", candidate: event.candidate },
            });
          }
        };

        // Connection State Changes
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") {
            setCallStatus("Connected");
          } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
            handleHangUp("Call disconnected");
          }
        };

        // 3. Negotiate (Offer / Answer)
        if (isIncoming && incomingCall?.offer) {
          setCallStatus("Answering call...");
          
          await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("call:accept", {
            callerId: peerId,
            calleeId: authUserData._id,
            answer,
          });
          
          setIncomingCall(null); // Clear incoming call state
        } else {
          setCallStatus("Ringing peer...");
          
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit("call:initiate", {
            callerId: authUserData._id,
            calleeId: peerId,
            offer,
            callerName: authUserData.fullname,
            callerPic: authUserData.profilePic,
            chatId,
          });
        }

      } catch (error) {
        console.error("WebRTC Error:", error);
        toast.error("Could not access camera/microphone");
        navigate(`/chat/${peerId}`);
      }
    };

    startCall();

    // Socket listeners for call status/signals
    socket.on("call:accepted", async ({ answer }) => {
      setCallStatus("Connecting WebRTC...");
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (e) {
          console.error("Error setting remote description:", e);
        }
      }
    });

    socket.on("call:rejected", () => {
      toast.error("Call was declined");
      handleHangUp("Declined");
    });

    socket.on("call:failed", ({ reason }) => {
      toast.error(reason || "Call failed");
      handleHangUp("Failed");
    });

    socket.on("webrtc:signal", async ({ signal }) => {
      if (!pcRef.current) return;
      try {
        if (signal.type === "candidate" && signal.candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (e) {
        console.error("Error adding ICE candidate:", e);
      }
    });

    socket.on("call:ended", () => {
      toast.success("Call ended by peer");
      handleHangUp("Ended");
    });

    return () => {
      socket.off("call:accepted");
      socket.off("call:rejected");
      socket.off("call:failed");
      socket.off("webrtc:signal");
      socket.off("call:ended");
      cleanupResources();
    };
  }, [socket, authUserData, peerId, isIncoming]);

  const cleanupResources = () => {
    // Stop all local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    // Close RTCPeerConnection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  };

  const handleHangUp = (status = "Ended") => {
    if (socket && peerId) {
      socket.emit("call:end", { peerId });
    }
    cleanupResources();
    toast.success("Call ended");
    navigate(`/chat/${peerId}`);
  };

  // Toggle Controls
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800 flex items-center gap-2 backdrop-blur-md">
        <Volume2 className="size-4 text-emerald-400 animate-pulse" />
        <span className="text-sm font-semibold">{callStatus}</span>
      </div>

      {/* Video Grid */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 gap-4 max-h-[calc(100vh-100px)] mt-12">
        {/* Remote Video Container */}
        <div className="relative flex-1 w-full h-full max-h-[70vh] md:max-h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-2xl">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center animate-pulse">
                <User className="size-12 text-slate-400" />
              </div>
              <p className="text-slate-400 font-medium">Waiting for peer...</p>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 bg-slate-950/70 py-1.5 px-3 rounded-lg text-xs font-semibold backdrop-blur-sm">
            Remote User
          </div>
        </div>

        {/* Local Video Container */}
        <div className="relative w-full md:w-80 h-48 md:h-60 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-xl">
          {localStream && !isVideoOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
                <User className="size-6 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500">Camera Off</p>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 bg-slate-950/70 py-1.5 px-3 rounded-lg text-xs font-semibold backdrop-blur-sm">
            You
          </div>
        </div>
      </div>

      {/* Call Controls Toolbar */}
      <div className="h-24 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-6 z-10">
        <button
          onClick={toggleMute}
          className={`btn btn-circle border-0 ${
            isMuted ? "btn-error text-white hover:bg-red-600" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
          }`}
        >
          {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </button>

        <button
          onClick={handleHangUp}
          className="btn btn-circle btn-error text-white hover:bg-red-600 border-0 shadow-lg size-14"
        >
          <PhoneOff className="size-6" />
        </button>

        <button
          onClick={toggleVideo}
          className={`btn btn-circle border-0 ${
            isVideoOff ? "btn-error text-white hover:bg-red-600" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
          }`}
        >
          {isVideoOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
        </button>
      </div>
    </div>
  );
};

export default CallPage;
