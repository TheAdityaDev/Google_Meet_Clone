import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useNavigate } from "react-router";
import { fetchFriendProfiles } from "../lib/api";
import { toast } from "react-hot-toast";
import { ArrowLeft, MessageSquare, MapPin, Mail, Globe, BookOpen } from "lucide-react";
import { capitalize } from "../lib/utils";

const ProfilePage = () => {
  const { id: friendId } = useParams();
  const navigate = useNavigate();

  const {
    data: friend,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userProfile", friendId],
    queryFn: async () => {
      try {
        const response = await fetchFriendProfiles(friendId);
        if (!response || !response.success) {
          throw new Error("Something went wrong.");
        }
        return response.friend;
      } catch (err) {
        toast.error("Error fetching profile");
        throw err;
      }
    },
    enabled: !!friendId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <span className="loading loading-ring loading-lg text-indigo-500" />
      </div>
    );
  }

  if (isError || !friend) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-rose-500">
        <p>{error?.message || "Profile data not found"}</p>
      </div>
    );
  }

  const infoFields = [
    { label: "Email Address", value: friend.email, icon: Mail },
    { label: "Location", value: friend.location || "Not specified", icon: MapPin },
    { label: "Native Language", value: capitalize(friend.nativeLanguage), icon: Globe },
    { label: "Learning Language", value: capitalize(friend.learningLanguage), icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex items-center justify-center">
      <div className="card w-full max-w-3xl bg-slate-900/50 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-md relative">
        {/* Soft glowing mesh banner background */}
        <div className="h-32 w-full bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-teal-900/40 border-b border-slate-800/80 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 btn btn-circle btn-sm btn-ghost bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200"
            title="Go Back"
          >
            <ArrowLeft className="size-4" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-8 md:px-10 relative">
          {/* Avatar floating layout */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 mb-6 gap-4">
            <div className="avatar ring-4 ring-slate-900 rounded-full overflow-hidden w-32 h-32 bg-slate-800 border border-slate-700 shadow-2xl">
              <img
                src={friend.profilePic || "https://avatar.iran.liara.run/public"}
                alt={friend.fullname}
                className="w-full h-full object-cover"
              />
            </div>
            <Link
              to={`/chat/${friend._id}`}
              className="btn btn-primary text-white font-bold px-6 shadow-indigo-600/20 shadow-lg rounded-xl flex items-center gap-1.5 h-11"
            >
              <MessageSquare className="size-4" /> Message
            </Link>
          </div>

          {/* User Meta */}
          <div className="space-y-1.5 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
              {friend.fullname}
            </h1>
            {friend.bio && (
              <p className="text-slate-400 italic text-sm md:text-base leading-relaxed font-medium">
                "{friend.bio}"
              </p>
            )}
          </div>

          {/* Profile details grid */}
          <div className="mt-8 pt-6 border-t border-slate-800/60">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 mb-4">
              Profile Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {infoFields.map((field, i) => {
                const Icon = field.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60"
                  >
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/10">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
                        {field.label}
                      </span>
                      <span className="text-slate-200 font-semibold text-sm truncate block">
                        {field.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
