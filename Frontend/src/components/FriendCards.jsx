import { MessageSquare, User, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserFriends } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import NoFriendsFound from "./NoFriendsFound";
import { Link } from "react-router";
import { getLanguageFlag } from "./FriendCard";
import { capitalize } from "../lib/utils";

const FriendCards = () => {
  const [friendsList, setFriendsList] = useState([]);

  const {
    data: friendResponse,
    isLoading: loadingFriends,
    error: friendError,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  useEffect(() => {
    if (!loadingFriends && friendResponse) {
      let friends;
      if (Array.isArray(friendResponse)) {
        friends = friendResponse;
      } else if (friendResponse.friends) {
        friends = friendResponse.friends;
      } else if (friendResponse.data) {
        friends = friendResponse.data;
      } else {
        friends = [];
      }
      setFriendsList(friends);
    }
  }, [friendResponse, loadingFriends]);

  return (
    <div className="container mx-auto px-4 py-6">
      {loadingFriends ? (
        <div className="flex items-center justify-center py-16">
          <span className="loading loading-ring loading-lg text-indigo-500"></span>
        </div>
      ) : friendError ? (
        <div className="text-rose-500 text-center py-8 bg-rose-500/10 border border-rose-500/20 rounded-2xl max-w-md mx-auto">
          <p className="font-semibold text-lg">Error loading friends</p>
          <p className="text-sm mt-1">{friendError.message}</p>
        </div>
      ) : friendsList.length === 0 ? (
        <NoFriendsFound />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {friendsList.map((friend) => (
            <div
              key={friend._id || friend.id}
              className="group card bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 hover:shadow-indigo-500/5 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] rounded-2xl overflow-hidden backdrop-blur-md"
            >
              {/* Profile Card Body */}
              <div className="card-body p-6 space-y-4">
                {/* Header Row */}
                <div className="flex items-center gap-4">
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-full ring-2 ring-indigo-500/30 overflow-hidden">
                      <img
                        src={friend.profilePic || "https://avatar.iran.liara.run/public"}
                        alt={friend.fullname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
                      {friend.fullname}
                    </h3>
                    {friend.location && (
                      <div className="flex items-center text-xs text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        <span className="truncate">{friend.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Languages Details */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="badge bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-xs font-semibold py-2 px-2.5 rounded-full flex items-center gap-1">
                    {getLanguageFlag(friend.nativeLanguage)}
                    Native: {capitalize(friend.nativeLanguage)}
                  </span>
                  <span className="badge bg-teal-500/10 text-teal-300 border-teal-500/20 text-xs font-semibold py-2 px-2.5 rounded-full flex items-center gap-1">
                    {getLanguageFlag(friend.learningLanguage)}
                    Learning: {capitalize(friend.learningLanguage)}
                  </span>
                </div>

                {/* Bio */}
                {friend.bio && (
                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed italic">
                    "{friend.bio}"
                  </p>
                )}

                {/* Actions Panel */}
                <div className="flex justify-between gap-2.5 pt-3 border-t border-slate-800/80 mt-auto">
                  <Link
                    to={`/profile/${friend._id}`}
                    className="btn btn-outline border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 btn-sm flex-1 font-semibold rounded-xl flex items-center gap-1"
                  >
                    <User className="size-4" />
                    Profile
                  </Link>
                  <Link
                    to={`/chat/${friend._id}`}
                    className="btn btn-primary text-white btn-sm flex-1 font-semibold rounded-xl flex items-center gap-1 shadow-lg"
                  >
                    <MessageSquare className="size-4" />
                    Chat
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendCards;
