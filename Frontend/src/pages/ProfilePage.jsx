import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { fetchFriendProfiles } from "../lib/api";
import { toast } from "react-hot-toast";
import styled from "styled-components";
import {ArrowLeftIcon} from 'lucide-react'

const ProfilePage = ({ onError, onSuccess }) => {
  const { id: friendProfileURL } = useParams();

  const StyledWrapper = styled.div`
    .input-group {
      position: relative;
      display: inline;
      margin-left: 30px;
    }

    .input {
      border: solid 1.5px #9e9e9e;
      border-radius: 1rem;
      background: none;
      padding: 1rem;
      font-size: 1rem;
      color: #f5f5f5;
      transition: border 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .user-label {
      position: absolute;
      left: 15px;
      color: #e8e8e8;
      pointer-events: none;
      transform: translateY(1rem);
      transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .input:focus,
    input:valid {
      outline: none;
      border: 1.5px solid #1a73e8;
    }

    .input:focus ~ label,
    input:valid ~ label {
      transform: translateY(-50%) scale(0.8);
      background-color: #212121;
      padding: 0 0.2em;
      color: #2196f3;
    }
  `;

  const {
    data: friendProfile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userProfile", friendProfileURL],
    queryFn: async () => {
      try {
        const response = await fetchFriendProfiles(friendProfileURL);
        if (!response || !response.success) {
          throw new Error("Something went wrong.");
        }
        return response.friend;
      } catch (err) {
        toast.error("Error fetching profile:", err);
        throw err;
      }
    },
    enabled: !!friendProfileURL,
    onError: (err) => {
      console.error("Query error:", err);
      onError?.(err);
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-ring loading-sm" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error.message || "An error occurred"}</p>
      </div>
    );
  }

  const friend = friendProfile;

  if (!friend) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No profile data available
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-5">
            <Link to="/friends" className="flex justify-end w-fit items-center btn btn-ghost mb-6">
            <ArrowLeftIcon className="size-6" /></Link>

      <div className="friends-container">
        <h3 className="text-xl font-semibold mb-4">User Profile:</h3>
        <div className="mb-6 p-4 flex gap-4" key={friend._id}>
          <img
            src={friend.profilePic || "/default-avatar.png"}
            alt={friend.fullname || "User"}
            className="w-[200px] h-[200px] object-cover "
          />
          <div className="friend-details mt-2 space-y-1 ml-40">
            <h1 className="text-lg font-semibold mb-10">
              {friend.fullname || "Unnamed User"}
            </h1>
            <StyledWrapper>
              <div className="input-group">
                <input
                  required
                  type="text"
                  name="text"
                  autoComplete="off"
                  className="input"
                  value={friend.fullname || "Unnamed User"}
                />
                <label className="user-label">First Name</label>
              </div>

              <div className="input-group">
                <input
                  required
                  type="text"
                  name="text"
                  autoComplete="off"
                  className="input"
                  value={friend.email || "Email Not Given"}
                />
                <label className="user-label">Email</label>
              </div>

              <div className="input-group">
                <input
                  required
                  type="text"
                  name="text"
                  autoComplete="off"
                  className="input"
                  value={friend.nativeLanguage || "Unnamed User"}
                />
                <label className="user-label">Native Language</label>
              </div>
            </StyledWrapper>
            <div>
              <StyledWrapper className="mt-20 pb-10">
                <div className="input-group">
                  <input
                    required
                    type="text"
                    name="text"
                    autoComplete="off"
                    className="input"
                    value={friend.learningLanguage || "Learning Language"}
                  />
                  <label className="user-label">Learning Language</label>
                </div>

                <div className="input-group">
                  <input
                    required
                    type="text"
                    name="text"
                    autoComplete="off"
                    className="input"
                    value={friend.location || "Location"}
                  />
                  <label className="user-label">Location</label>
                </div>

                <div className="input-group">
                  <input
                    required
                    type="text"
                    name="text"
                    autoComplete="off"
                    className="input"
                    value={friend.bio || "Unnamed User"}
                  />
                  <label className="user-label">Bio</label>
                </div>
              </StyledWrapper>
            </div>
            <Link to={`/chat/${friend._id}` } className="flex justify-end w-fit items-center btn btn-success ml-4">Message</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
