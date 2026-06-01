import React from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../context/SocketContext";
import useAuthUser from "../hooks/useAuthUser";
import { Phone, PhoneOff, User } from "lucide-react";

const IncomingCallModal = () => {
  const { incomingCall, setIncomingCall, socket } = useSocket();
  const { authUserData } = useAuthUser();
  const navigate = useNavigate();

  if (!incomingCall || !authUserData) return null;

  const { callerId, callerName, callerPic, chatId } = incomingCall;

  const handleAccept = () => {
    // Navigate to the WebRTC call page as the incoming respondent (callee)
    navigate(`/call/${chatId}?peerId=${callerId}&incoming=true`);
  };

  const handleDecline = () => {
    if (socket) {
      socket.emit("call:reject", {
        callerId,
        calleeId: authUserData._id,
      });
    }
    setIncomingCall(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center space-y-6 animate-scale-up">
        {/* Ringing Visual */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping duration-1000"></div>
          <div className="absolute -inset-4 rounded-full bg-emerald-500/10 animate-pulse"></div>
          
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl bg-slate-800 flex items-center justify-center">
            {callerPic ? (
              <img
                src={callerPic}
                alt={callerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="size-12 text-slate-400" />
            )}
          </div>
        </div>

        {/* Text Info */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-100">{callerName}</h3>
          <p className="text-sm text-emerald-400 font-semibold animate-pulse tracking-wide uppercase">
            Incoming Video Call...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-6 w-full justify-center pt-2">
          {/* Decline Button */}
          <button
            onClick={handleDecline}
            className="btn btn-circle btn-error size-14 shadow-lg hover:scale-105 active:scale-95 transition-transform border-0 text-white"
            title="Decline Call"
          >
            <PhoneOff className="size-6" />
          </button>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            className="btn btn-circle btn-success size-14 shadow-lg hover:scale-105 active:scale-95 transition-transform border-0 text-white animate-bounce"
            title="Accept Call"
          >
            <Phone className="size-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
