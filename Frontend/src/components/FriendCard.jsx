import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFriend } from "../lib/api";
import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "./../constants/index";
import { Trash, MessageSquare, User } from "lucide-react";
import { capitalize } from "../lib/utils";

const FriendCard = ({ friend, onFriendRemoved }) => {
  const queryClient = useQueryClient();

  const { mutate: removeFriend, isPending } = useMutation({
    mutationFn: deleteFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      if (onFriendRemoved) {
        onFriendRemoved(friend._id);
      }
    },
  });

  const handleUnfriend = () => {
    if (window.confirm(`Are you sure you want to remove ${friend.fullname} from your friends list?`)) {
      removeFriend(friend._id);
    }
  };

  return (
    <div className="group card bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] rounded-2xl overflow-hidden backdrop-blur-md">
      <div className="card-body p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full ring-2 ring-indigo-500/30 overflow-hidden">
              <img src={friend.profilePic} alt={friend.fullname} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
              {friend.fullname}
            </h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Friend</span>
          </div>
        </div>

        {/* Languages Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="badge bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[10px] font-semibold py-1.5 px-2 rounded-full flex items-center">
            {getLanguageFlag(friend.nativeLanguage)}
            {capitalize(friend.nativeLanguage)}
          </span>
          <span className="badge bg-teal-500/10 text-teal-300 border-teal-500/20 text-[10px] font-semibold py-1.5 px-2 rounded-full flex items-center">
            {getLanguageFlag(friend.learningLanguage)}
            {capitalize(friend.learningLanguage)}
          </span>
        </div>

        {/* Action Panel */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80 mt-auto">
          <Link
            to={`/profile/${friend._id}`}
            className="btn btn-outline border-slate-800 hover:bg-slate-800 text-slate-300 btn-xs h-8 px-2.5 rounded-lg flex items-center gap-1"
            title="View Profile"
          >
            <User className="size-3.5" />
          </Link>
          
          <Link
            to={`/chat/${friend._id}`}
            className="btn btn-primary text-white btn-xs h-8 px-4 flex-1 rounded-lg flex items-center gap-1 shadow-lg"
          >
            <MessageSquare className="size-3.5" />
            Chat
          </Link>
          
          <button
            onClick={handleUnfriend}
            disabled={isPending}
            className="btn btn-ghost btn-circle btn-xs h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center justify-center border border-slate-800/50 hover:border-rose-500/20"
            title="Unfriend User"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-xs text-rose-500"></span>
            ) : (
              <Trash className="size-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;

// Language country flag utility
export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/16x12/${countryCode}.png`}
        alt={`${countryCode} flag`}
        className="w-3.5 h-2.5 inline-block mr-1 rounded-[1px]"
      />
    );
  }

  return null;
}
