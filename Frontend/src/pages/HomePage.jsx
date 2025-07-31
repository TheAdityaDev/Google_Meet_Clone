import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheckIcon, MapPin, UserPlusIcon, UsersIcon } from "lucide-react";
import {
  cancelFriendRequest,
  getRecommendedUser,
  getUserFriends,
  outGoingFriendReqs,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router"; // Fixed import from react-router-dom
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { capitalize } from "../lib/utils";


const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestIds, setOutgoingRequestIds] = useState(new Set());
  const [friendsList, setFriendsList] = useState([]);

  // Friends Query with error handling
  const {
    data: friendResponse,
    isLoading: loadingFriends,
    error: friendError,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    onSuccess: (data) => {
      console.log("Friends data received:", data); // Debug log
    },
    onError: (error) => {
      console.error("Error fetching friends:", error); // Error logging
    },
  });

  const { mutate: cancelRequestMutation } = useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
    },
  });

  // Rest of queries remain the same
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(outgoingRequests)]);

  // --- Handle recommended users array extraction ---
  let recommendedUsers = [];
  if (recommendedUsersResponse) {
    // If API returns { success, recommendedUsers }
    if (Array.isArray(recommendedUsersResponse.recommendedUsers)) {
      recommendedUsers = recommendedUsersResponse.recommendedUsers;
    } else if (Array.isArray(recommendedUsersResponse)) {
      // If API returns array directly
      recommendedUsers = recommendedUsersResponse;
    }
  }

  let Friends = [];

  // Improved friends list handling
  useEffect(() => {
    if (!loadingFriends && friendResponse) {
      console.log("Processing friend response:", friendResponse); // Debug log

      let friends;
      if (Array.isArray(friendResponse)) {
        friends = friendResponse;
      } else if (friendResponse.friends) {
        // Check for friends propertyf
        friends = friendResponse.friends;
      } else if (friendResponse.data) {
        // Check for data property
        friends = friendResponse.data;
      } else {
        friends = [];
        console.warn("Unexpected friends response format:", friendResponse);
      }

      console.log("Processed friends:", friends); // Debug log
      setFriendsList(friends);
    }
  }, [friendResponse, loadingFriends]);

  // Rest of the component remains the same...
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        {/* Friends Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Your Friends</h2>
          <Link to="/notification">
            <button className="btn btn-ghost btn-sm">
              <UsersIcon className="mr-2 size-4" />
              Friend Requests
            </button>
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex items-center justify-center">
            <span className="loading loading-ring loading-lg"></span>
          </div>
        ) : friendError ? (
          <div className="text-red-500 text-center">
            Error loading friends: {friendError.message}
          </div>
        ) : friendsList.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friendsList.map((friend) => (
              <FriendCard key={friend._id ?? friend.id} friend={friend} />
            ))}
          </div>
        )}

        {/* --- Recommendations Section --- */}
        <section>
          <div className="mb-6 sm:mb-8">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">
              Meet New People
            </div>
            <p className="opacity-70">
              Connect with new faces and uncover unforgettable adventures.
            </p>
          </div>

          {/* CORRECTED LOGIC: Show spinner while loading is TRUE */}
          {loadingRecommendedUsers ? (
            <div className="flex items-center justify-center pt-16">
              <div className="loading-ring animate-pulse"></div>
            </div>
          ) : errorRecommendedUsers ? (
            <div className="bg-red-800 rounded-lg p-8 text-center mt-8 max-w-md mx-auto">
              <h3 className="font-semibold text-xl mb-2 text-white">
                Error loading recommendations
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Please try again later.
              </p>
            </div>
          ) : !Array.isArray(recommendedUsers) ||
            recommendedUsers.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center mt-8 max-w-md mx-auto">
              <h3 className="font-semibold text-xl mb-2 text-white">
                No Recommendations Available
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                We couldn't find any new partners for you right now. Please
                check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestIds.has(user._id);
                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full overflow-hidden">
                          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-indigo-500/50">
                            <img
                              src={user.profilePic}
                              alt={user.fullname}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-white">
                            {user.fullname}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <MapPin className="w-3 h-3 mr-1.5" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 my-4">
                        <span className="badge bg-indigo-500/20 text-indigo-300 border-0 text-xs font-medium py-2 px-3 rounded-full">
                          {getLanguageFlag(user.nativeLanguage)}
                          &nbsp;Native: {capitalize(user.nativeLanguage)}
                        </span>
                        <span className="badge bg-teal-500/20 text-teal-300 border-0 text-xs font-medium py-2 px-3 rounded-full">
                          {getLanguageFlag(user.learningLanguage)}
                          &nbsp;Learning: {capitalize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && (
                        <p className="text-sm text-gray-400 flex-grow">
                          {user.bio}
                        </p>
                      )}

                      <div className="card-actions mt-4">
                        {hasRequestBeenSent ? (
                          <button
                            className="btn w-full mt-2 text-white btn-error"
                            onClick={() => cancelRequestMutation(user._id)}
                            disabled={sendingRequestIds.has(user._id)}
                          >
                            <CheckCheckIcon className="w-5 h-5 mr-2" />
                            Cancel Request
                          </button>
                        ) : (
                          <button
                            className="btn w-full mt-2 btn-primary"
                            onClick={() => sendRequestMutation.mutate(user._id)}
                            disabled={sendingRequestIds.has(user._id)}
                          >
                            {sendingRequestIds.has(user._id) ? (
                              <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                              <>
                                <UserPlusIcon className="w-5 h-5 mr-2" />
                                Send Request
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
    </div>
  );
};

export default HomePage;
