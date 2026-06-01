import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCheckIcon,
  MapPin,
  UserPlusIcon,
  UsersIcon,
  Plus,
  MessageSquare,
} from "lucide-react";
import {
  cancelFriendRequest,
  getRecommendedUser,
  getUserFriends,
  outGoingFriendReqs,
  sendFriendRequest,
  getUserChats,
} from "../lib/api";
import { Link, useNavigate } from "react-router";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { capitalize } from "../lib/utils";
import CreateGroupModal from "../components/CreateGroupModal";
import useAuthUser from "../hooks/useAuthUser";

const HomePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { authUserData } = useAuthUser();
  const [outgoingRequestIds, setOutgoingRequestIds] = useState(new Set());
  const [friendsList, setFriendsList] = useState([]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  // Fetch ongoing chats (DMs + Groups)
  const { data: chatsResponse, isLoading: loadingChats } = useQuery({
    queryKey: ["userChats"],
    queryFn: getUserChats,
    enabled: !!authUserData,
  });

  const activeChats = chatsResponse?.chats || [];

  // Friends Query with error handling
  const {
    data: friendResponse,
    isLoading: loadingFriends,
    error: friendError,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { mutate: cancelRequestMutation } = useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
    },
  });

  const {
    data: recommendedUsersResponse,
    isLoading: loadingRecommendedUsers,
    isError: errorRecommendedUsers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUser,
  });

  const { data: outgoingRequests = [] } = useQuery({
    queryKey: ["outgoingRequests"],
    queryFn: outGoingFriendReqs,
  });

  const [sendingRequestIds, setSendingRequestIds] = useState(new Set());

  const sendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onMutate: async (userId) => {
      setSendingRequestIds((prev) => new Set(prev).add(userId));
    },
    onSettled: (data, error, userId) => {
      setSendingRequestIds((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
    },
  });

  useEffect(() => {
    if (Array.isArray(outgoingRequests)) {
      setOutgoingRequestIds(
        new Set(outgoingRequests.map((req) => req.recipient._id))
      );
    }
  }, [outgoingRequests]);

  let recommendedUsers = [];
  if (recommendedUsersResponse) {
    if (Array.isArray(recommendedUsersResponse.recommendedUsers)) {
      recommendedUsers = recommendedUsersResponse.recommendedUsers;
    } else if (Array.isArray(recommendedUsersResponse)) {
      recommendedUsers = recommendedUsersResponse;
    }
  }

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
    <div className="p-4 md:p-6 lg:p-8 space-y-12">
      <div className="container mx-auto space-y-12">
        
        {/* Chats & Groups Conversations Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Chats & Conversations</h2>
              <p className="text-sm opacity-60">Join your direct chats and active groups</p>
            </div>
            <button
              onClick={() => setIsCreateGroupOpen(true)}
              className="btn btn-primary text-white btn-sm md:btn-md shadow-lg rounded-xl flex items-center gap-1"
            >
              <Plus className="size-4" />
              Create Group
            </button>
          </div>

          {loadingChats ? (
            <div className="flex items-center justify-center py-6">
              <span className="loading loading-spinner text-indigo-500"></span>
            </div>
          ) : activeChats.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-2xl text-center backdrop-blur-md">
              <p className="text-slate-400 font-medium">No active chats or groups yet.</p>
              <p className="text-xs text-slate-500 mt-1">Start messaging one of your friends below or create a group chat.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activeChats.map((chat) => {
                const isGroup = chat.isGroup;
                const friend = isGroup
                  ? null
                  : chat.participants.find((p) => p._id !== authUserData?._id);
                
                const displayName = isGroup ? chat.groupName : (friend?.fullname || "Direct Chat");
                const displayPic = isGroup
                  ? `https://avatar.iran.liara.run/username?username=${encodeURIComponent(chat.groupName)}`
                  : (friend?.profilePic || "https://avatar.iran.liara.run/public");

                const lastMsg = chat.lastMessage;
                const lastMsgText = lastMsg
                  ? `${lastMsg.sender._id === authUserData?._id ? "You" : lastMsg.sender.fullname.split(" ")[0]}: ${
                      lastMsg.fileType ? `[${capitalize(lastMsg.fileType)}]` : lastMsg.content
                    }`
                  : "No messages yet";

                return (
                  <div
                    key={chat._id}
                    onClick={() => navigate(`/chat/${chat._id}`)}
                    className="card bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 hover:shadow-2xl transition-all cursor-pointer p-4 rounded-xl flex flex-row items-center gap-3.5 hover:scale-[1.02] backdrop-blur-sm duration-300"
                  >
                    <img
                      src={displayPic}
                      alt={displayName}
                      className="w-12 h-12 rounded-full border border-slate-800"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-100 truncate">{displayName}</h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{lastMsgText}</p>
                      <span className="badge badge-outline border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-2.5">
                        {isGroup ? "Group Chat" : "Direct Chat"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Friends Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Your Friends</h2>
              <p className="text-sm opacity-60">Manage your connected friends list</p>
            </div>
            <Link to="/notification">
              <button className="btn btn-ghost btn-sm md:btn-md border border-slate-800 hover:bg-slate-900 rounded-xl">
                <UsersIcon className="mr-2 size-4 text-indigo-400" />
                Requests
              </button>
            </Link>
          </div>

          {loadingFriends ? (
            <div className="flex items-center justify-center">
              <span className="loading loading-ring loading-lg text-indigo-500"></span>
            </div>
          ) : friendError ? (
            <div className="text-red-500 text-center">
              Error loading friends: {friendError.message}
            </div>
          ) : friendsList.length === 0 ? (
            <NoFriendsFound />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {friendsList.map((friend) => (
                <FriendCard key={friend._id ?? friend.id} friend={friend} />
              ))}
            </div>
          )}
        </section>

        {/* Recommendations Section */}
        <section className="space-y-6 border-t border-slate-800/60 pt-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Meet New People</h2>
            <p className="text-sm opacity-60">Connect with new users and practice languages</p>
          </div>

          {loadingRecommendedUsers ? (
            <div className="flex items-center justify-center pt-16">
              <div className="loading-ring animate-pulse text-indigo-500"></div>
            </div>
          ) : errorRecommendedUsers ? (
            <div className="bg-red-950/20 border border-red-950/30 rounded-2xl p-8 text-center max-w-md mx-auto">
              <h3 className="font-semibold text-lg text-rose-500 mb-2">Error loading recommendations</h3>
              <p className="text-sm text-slate-400">Please try again later.</p>
            </div>
          ) : !Array.isArray(recommendedUsers) || recommendedUsers.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto">
              <h3 className="font-semibold text-lg text-slate-300 mb-2">No Recommendations</h3>
              <p className="text-sm text-slate-500">Check back later for new connections.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestIds.has(user._id);
                return (
                  <div
                    key={user._id}
                    className="card bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] rounded-2xl overflow-hidden backdrop-blur-md"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-14 h-14 rounded-full border border-slate-800 ring-2 ring-indigo-500/30 overflow-hidden">
                            <img src={user.profilePic} alt={user.fullname} className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
                            {user.fullname}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-xs text-slate-400 mt-1">
                              <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                              <span className="truncate">{user.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="badge bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[10px] font-semibold py-1.5 px-2 rounded-full">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitalize(user.nativeLanguage)}
                        </span>
                        <span className="badge bg-teal-500/10 text-teal-300 border-teal-500/20 text-[10px] font-semibold py-1.5 px-2 rounded-full">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitalize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && (
                        <p className="text-sm text-slate-400 italic line-clamp-2">
                          "{user.bio}"
                        </p>
                      )}

                      <div className="card-actions mt-4 pt-3 border-t border-slate-800/80">
                        {hasRequestBeenSent ? (
                          <button
                            className="btn w-full text-white btn-error btn-sm rounded-xl"
                            onClick={() => cancelRequestMutation(user._id)}
                            disabled={sendingRequestIds.has(user._id)}
                          >
                            Cancel Request
                          </button>
                        ) : (
                          <button
                            className="btn w-full btn-primary text-white btn-sm rounded-xl shadow-lg"
                            onClick={() => sendRequestMutation.mutate(user._id)}
                            disabled={sendingRequestIds.has(user._id)}
                          >
                            {sendingRequestIds.has(user._id) ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <>
                                <UserPlusIcon className="w-4 h-4 mr-1.5" />
                                Connect
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* CREATE GROUP MODAL */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={(newGroup) => {
          navigate(`/chat/${newGroup._id}`);
        }}
      />
    </div>
  );
};

export default HomePage;
