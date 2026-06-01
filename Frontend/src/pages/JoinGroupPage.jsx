import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { getGroupInviteInfo, joinGroupChat } from "../lib/api";
import { UsersIcon, MessageSquareIcon, ArrowLeftIcon } from "lucide-react";
import toast from "react-hot-toast";

const JoinGroupPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await getGroupInviteInfo(chatId);
        if (data.success) {
          setGroupInfo(data);
        } else {
          toast.error("Failed to load group details.");
        }
      } catch (error) {
        toast.error("Invalid invite link or group not found.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    if (chatId) fetchInfo();
  }, [chatId, navigate]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const data = await joinGroupChat(chatId);
      if (data.success) {
        toast.success(`Welcome to ${groupInfo?.groupName || "the group"}!`);
        navigate("/");
      } else {
        toast.error("Could not join group.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join group.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-dashed border-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-medium animate-pulse">Loading invitation details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center relative z-10">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <img
            src={groupInfo?.groupPic || "https://avatar.iran.liara.run/username?username=Group"}
            alt={groupInfo?.groupName}
            className="relative w-24 h-24 rounded-full border-2 border-white/20 object-cover"
          />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
          You&apos;ve Been Invited!
        </h1>
        <p className="mt-2 text-slate-400 text-center text-sm">
          You have been invited to join the group conversation.
        </p>

        {/* Group Details Card */}
        <div className="w-full bg-white/5 border border-white/5 rounded-xl p-4 mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Group Name</span>
            <span className="font-semibold text-slate-100">{groupInfo?.groupName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Members</span>
            <div className="flex items-center gap-1.5 text-primary">
              <UsersIcon className="w-4 h-4" />
              <span className="font-semibold">{groupInfo?.memberCount} users</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="w-full mt-8 space-y-3">
          <button
            onClick={handleJoin}
            disabled={joining}
            className="relative w-full group overflow-hidden rounded-xl p-[2px] focus:outline-none transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-secondary animate-gradient-xy"></span>
            <div className="relative flex items-center justify-center gap-2 px-6 py-3 bg-slate-950 rounded-xl text-white font-medium transition-all group-hover:bg-slate-950/90">
              {joining ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Joining Group...</span>
                </>
              ) : (
                <>
                  <MessageSquareIcon className="w-5 h-5 text-primary group-hover:text-purple-400 transition-colors" />
                  <span>Accept & Join Chat</span>
                </>
              )}
            </div>
          </button>

          <button
            onClick={() => navigate("/")}
            disabled={joining}
            className="w-full py-3 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-slate-300 hover:text-white"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Decline & Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinGroupPage;
