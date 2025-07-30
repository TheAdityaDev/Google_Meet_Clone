import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFriend } from "../lib/api"; // make sure path is correct
import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from './../constants/index';
import {  DeleteIcon, Trash } from "lucide-react";



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

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow duration-300">
      <div className="card-body p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={friend.fullname} />
          </div>
          <h3 className="font-semibold truncate">{friend.fullname}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)} Native:{friend.nativeLanguage}
          </span>
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.learningLanguage)} Learning:{friend.learningLanguage}
          </span>
        </div>

        <div className="flex justify-between gap-2">
          <Link to={`/chat/${friend._id}`} className="btn btn-ghost btn-sm">
            Message
          </Link>
          <button
            onClick={() => removeFriend(friend._id)}
            disabled={isPending}
            className="btn btn-error btn-sm"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <Trash className="size-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;

// eslint-disable-next-line react-refresh/only-export-components
export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/16x12/${countryCode}.png`}
        alt={`${countryCode} flag`}
        className="w-4 h-4 inline-block mr-1"
      />
    );
  }

  return null;
}
