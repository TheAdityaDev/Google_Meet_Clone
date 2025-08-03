import { axiosInstance } from "./axios.js";

// Singup
export const signup = async (signupData) => {
  try {
    const res = await axiosInstance.post("/auth/signup", signupData);
    return res.data;
  } catch (error) {
    throw error('Something went wrong, Please try later....'); // Optional: re-throw for UI handling
  }
};


// Login
export const login = async (loginData) => {
  try {
    const res = await axiosInstance.post("/auth/login", loginData);
    return res.data;
  } catch (error) {
    throw error('Something went wrong, Please try later....')
  }
};

// Logout
export const logout = async () => {
  try {
    const res = await axiosInstance.post("/auth/logout");
    return res.data;
  } catch (error) {
    throw error('Something went wrong, Please try later....')
  }
};

// Autntication
export const AuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
     error('Something went wrong, Please try later....')
    return null;
  }
};

// Get User friends
export const getUserFriends = async () => {
  try {
    const res = await axiosInstance.get("/users/friends");
    return res.data;
  } catch (error) {
   throw error('Something went wrong, Please try later....')
  }
};

// Recommend User to new friends
export const getRecommendedUser = async () => {
  try {
    const res = await axiosInstance.get("/users");
    return res.data;
  } catch (error) {
    throw error('Something went wrong, Please try later....')
  }
};

// Out going friend Fetch friends user
export const outGoingFriendReqs = async () => {
  try {
    const res = await axiosInstance.get("/users/outgoing-friend-requests");
    return res.data;
  } catch (error) {
    throw error('Something went wrong, Please try later....')
  }
};

// Send request to other users
export const sendFriendRequest = async (userId) => {
  try {
    const res = await axiosInstance.post(`/users/friend-request/${userId}`);
    return res.data;
  } catch (error) {
    throw error('Something went wrong, Please try later....')
  }
};
// Onboarding completion
export const completeOnboarding = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/onboarding", userData);
    return response.data;
  } catch (error) {
    throw error('Something went wrong, Please try later....')
  }
};

// Get friend requests
export const getFriendRequest = async () => {
  try {
    const response = await axiosInstance.get("/users/friend-requests");
    return response.data;
  } catch (error) {
    throw error('Something went wrong, Please try later....')
  }
};

// cancel friend request
export const cancelFriendRequest = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/users/friend-request/${userId}/cancel`);
    return response.data;
  } catch (error) {
    throw error('Something went wrong, Please try later....')
  }
};

// Accept request
export const acceptFriendRequest = async (requestId) => {
  try {
    const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`,requestId);
    return response.data;
  } catch (error) {
    throw error('Something went wrong, Please try later....')
  }
};

// Reject request
export const rejectFriendRequest = async (requestId) => {
  try {
    const response = await axiosInstance.put(`/users/friend-request/${requestId}/reject`,requestId);
    return response.data;
  } catch (error) {
    throw error('Something went wrong, Please try later....')
  }
};

// Delete the friend in the user's friend list
export const deleteFriend = async (friendId) => {
  const response = await axiosInstance.delete(`/users/friend/${friendId}`);
  return response.data;
};

// Auth to verify the user video call token is true or false
export const getStreamToken = async () => {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
};

// Profile section - Fetch friend profiles
export const fetchFriendProfiles = async (friendId) => {
  const response = await axiosInstance.get(`/users/friend-profile/${friendId}`);
  return response.data; // Assume it returns an array of friend profiles
};
// User profile data 
export const fetchUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/users/user-profile', {
      timeout: 5000, // ⏰ will throw if API hangs over 5s
    });
    return response.data.user;
  } catch (error) {
    throw error("Something went wrong while fetching profile")
  }
};

