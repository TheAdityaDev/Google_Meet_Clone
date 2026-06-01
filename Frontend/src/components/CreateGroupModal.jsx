import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserFriends, createGroupChat } from "../lib/api";
import { X, Users, Search } from "lucide-react";
import toast from "react-hot-toast";

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const queryClient = useQueryClient();
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: friendsResponse, isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: isOpen,
  });

  const friends = friendsResponse?.friends || friendsResponse || [];

  const { mutate: createGroup, isPending } = useMutation({
    mutationFn: createGroupChat,
    onSuccess: (data) => {
      toast.success("Group created successfully!");
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      if (onGroupCreated) onGroupCreated(data.chat);
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create group");
    },
  });

  const handleClose = () => {
    setGroupName("");
    setSelectedFriends([]);
    setSearchQuery("");
    onClose();
  };

  const handleToggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (selectedFriends.length === 0) {
      toast.error("Please select at least one friend");
      return;
    }

    createGroup({
      groupName: groupName.trim(),
      participants: selectedFriends,
    });
  };

  if (!isOpen) return null;

  const filteredFriends = friends.filter((f) =>
    f.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-100">Create New Group</h3>
          </div>
          <button onClick={handleClose} className="btn btn-ghost btn-circle btn-sm text-slate-400">
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
          {/* Group Name input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-slate-300 font-semibold">Group Name</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Study Group, Project Team"
              className="input input-bordered w-full bg-slate-950 border-slate-800 focus:border-indigo-500 text-slate-200"
              required
            />
          </div>

          {/* Search friends */}
          <div className="form-control flex-1 flex flex-col min-h-[250px]">
            <label className="label">
              <span className="label-text text-slate-300 font-semibold">
                Select Members ({selectedFriends.length})
              </span>
            </label>

            <div className="relative mb-2">
              <Search className="size-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full bg-slate-950 border-slate-800 text-slate-200 pl-10 text-sm h-10"
              />
            </div>

            {/* Friends list container */}
            <div className="flex-1 border border-slate-800 rounded-xl overflow-y-auto bg-slate-950 max-h-[200px] divide-y divide-slate-800/50">
              {isLoading ? (
                <div className="flex items-center justify-center p-6 h-full">
                  <span className="loading loading-spinner text-indigo-500"></span>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="text-center text-slate-500 text-sm p-8">
                  No friends found to add
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <div
                    key={friend._id}
                    onClick={() => handleToggleFriend(friend._id)}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-900 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={friend.profilePic || "https://avatar.iran.liara.run/public"}
                        alt={friend.fullname}
                        className="w-8 h-8 rounded-full border border-slate-800"
                      />
                      <span className="text-slate-200 text-sm font-medium">{friend.fullname}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => {}} // Controlled by wrapper div click
                      className="checkbox checkbox-primary checkbox-sm border-slate-700 pointer-events-none"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-3 pt-2 mt-auto border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline border-slate-800 text-slate-300 hover:bg-slate-800"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-white"
              disabled={isPending}
            >
              {isPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Create Group"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
