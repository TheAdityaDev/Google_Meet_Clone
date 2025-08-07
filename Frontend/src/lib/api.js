import { axiosInstance } from "./axios.js";

export const signup = async (signupData) => {
  try {
    const res = await axiosInstance.post("/auth/signup", signupData);
    return res.data;
  } catch (error) {
    // Handle specific axios errors gracefully
    if (error.response) {
      // Backend responded with a status code (e.g. 400, 409)
      const errorMessage = error.response.data?.message || 'Signup failed. Please try again.';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Check your internet connection.');
    } else {
      // Something else caused the error
      throw new Error('Unexpected error during signup.');
    }
  }
};


export const login = async (loginData) => {
  try {
    const res = await axiosInstance.post("/auth/login", loginData);
    return res.data;
  } catch (error) {
    if (error.response) {
      // Server responded with a status code (e.g. 401, 400)
      const errorMessage = error.response.data?.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response (e.g. network issue)
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      // Something else happened
      throw new Error('Unexpected error during login.');
    }
  }
};


export const logout = async () => {
  try {
    const res = await axiosInstance.post("/auth/logout");
    return res.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error; // Optional: re-throw for UI handling
  }
};
export const AuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.error("fetching  error:", error);
    return null;
  }
};

export const getUserFriends = async () => {
  try {
    const res = await axiosInstance.get("/users/friends");
    return res.data;
  } catch (error) {
    console.error("Fetch to friend error:", error);
    throw error; // Optional: re-throw for UI handling
  }
};

export const getRecommendedUser = async () => {
  try {
    const res = await axiosInstance.get("/users");
    return res.data;
  } catch (error) {
    console.error("Fetch to friends error:", error);
    throw error; // Optional: re-throw for UI handling
  }
};

export const outGoingFriendReqs = async () => {
  try {
    const res = await axiosInstance.get("/users/outgoing-friend-requests");
    return res.data;
  } catch (error) {
    console.error("Fetch to friends error:", error);
    throw error; // Optional: re-throw for UI handling
  }
};

export const sendFriendRequest = async (userId) => {
  try {
    const res = await axiosInstance.post(`/users/friend-request/${userId}`);
    return res.data;
  } catch (error) {
    console.error("send to friends request error:", error);
    throw error; // Optional: re-throw for UI handling
  }
};
export const completeOnboarding = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/onboarding", userData);
    return response.data;
  } catch (error) {
    console.log('Error onboard',error);
  }
};

export const getFriendRequest = async () => {
  try {
    const response = await axiosInstance.get("/users/friend-requests");
    return response.data;
  } catch (error) {
    console.log("The friend request error", error);
  }
};


export const cancelFriendRequest = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/users/friend-request/${userId}/cancel`);
    return response.data;
  } catch (error) {
    console.log("Cancel error", error);
  }
};

export const acceptFriendRequest = async (requestId) => {
  try {
    const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`,requestId);
    return response.data;
  } catch (error) {
    console.log("Accept friend request error", error);
  }
};


export const rejectFriendRequest = async (requestId) => {
  try {
    const response = await axiosInstance.put(`/users/friend-request/${requestId}/reject`,requestId);
    return response.data;
  } catch (error) {
    console.log("Accept friend request error", error);
  }
};


export const deleteFriend = async (friendId) => {
  const response = await axiosInstance.delete(`/users/friend/${friendId}`);
  return response.data;
};

export const getStreamToken = async () => {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
};


export const fetchFriendProfiles = async (friendId) => {
  const response = await axiosInstance.get(`/users/friend-profile/${friendId}`);
  return response.data; // Assume it returns an array of friend profiles
};

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
