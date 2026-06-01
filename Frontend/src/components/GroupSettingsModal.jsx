import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserFriends,
  updateGroupDetails,
  deleteGroupChat,
  addMembersToGroup,
  removeMemberFromGroup,
} from "../lib/api";
import { X, Settings, Trash, UserMinus, UserPlus, LogOut, Shield } from "lucide-react";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

const GroupSettingsModal = ({ isOpen, onClose, chat, onGroupUpdated, onGroupDeleted }) => {
  const queryClient = useQueryClient();
  const { authUserData } = useAuthUser();
  const [groupName, setGroupName] = useState(chat?.groupName || "");
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const isGroup = chat?.isGroup;
  const chatId = chat?._id;

  // Determine if the current user is admin
  const isAdmin = chat?.admins?.includes(authUserData?._id) || 
                  chat?.admins?.some(admin => (admin._id || admin) === authUserData?._id);

  const { data: friendsResponse } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: isOpen && isAddingMembers,
  });

  const friends = friendsResponse?.friends || friendsResponse || [];

  // Filter out friends that are already participants
  const nonParticipants = friends.filter(
    (friend) =>
      !chat?.participants?.some(
        (part) => (part._id || part) === friend._id
      )
  );

  const { mutate: updateGroup, isPending: updating } = useMutation({
    mutationFn: (data) => updateGroupDetails(chatId, data),
    onSuccess: (data) => {
      toast.success("Group updated!");
      queryClient.invalidateQueries({ queryKey: ["directChat"] });
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      if (onGroupUpdated) onGroupUpdated(data.chat);
    },
    onError: () => toast.error("Failed to update group"),
  });

  const { mutate: addMembers, isPending: adding } = useMutation({
    mutationFn: (newMembers) => addMembersToGroup(chatId, newMembers),
    onSuccess: (data) => {
      toast.success("Members added!");
      setIsAddingMembers(false);
      setSelectedFriends([]);
      queryClient.invalidateQueries({ queryKey: ["directChat"] });
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      if (onGroupUpdated) onGroupUpdated(data.chat);
    },
    onError: () => toast.error("Failed to add members"),
  });

  const { mutate: removeMember, isPending: removing } = useMutation({
    mutationFn: (pId) => removeMemberFromGroup(chatId, pId),
    onSuccess: (data) => {
      toast.success(data.message || "Member removed!");
      queryClient.invalidateQueries({ queryKey: ["directChat"] });
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      if (onGroupUpdated) onGroupUpdated(data.chat);
    },
    onError: () => toast.error("Failed to remove member"),
  });

  const { mutate: deleteGroup, isPending: deleting } = useMutation({
    mutationFn: () => deleteGroupChat(chatId),
    onSuccess: () => {
      toast.success("Group deleted!");
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      if (onGroupDeleted) onGroupDeleted(chatId);
      onClose();
    },
    onError: () => toast.error("Failed to delete group"),
  });

  const handleUpdateGroupName = (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    updateGroup({ groupName: groupName.trim() });
  };

  const handleAddMembersSubmit = (e) => {
    e.preventDefault();
    if (selectedFriends.length === 0) return;
    addMembers(selectedFriends);
  };

  const handleToggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleLeaveGroup = () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      removeMember(authUserData?._id);
      onClose();
      if (onGroupDeleted) onGroupDeleted(chatId); // Redirect to homepage
    }
  };

  const handleDeleteGroup = () => {
    if (window.confirm("CRITICAL: Are you sure you want to delete this group and all its message history?")) {
      deleteGroup();
    }
  };

  if (!isOpen || !chat) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-100">Group Settings</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm text-slate-400">
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Edit Group Name (Admins Only) */}
          {isAdmin ? (
            <form onSubmit={handleUpdateGroupName} className="space-y-2">
              <label className="text-slate-300 font-semibold text-sm">Update Group Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="input input-bordered bg-slate-950 border-slate-800 focus:border-indigo-500 flex-1 text-slate-200 text-sm h-10"
                />
                <button
                  type="submit"
                  disabled={updating}
                  className="btn btn-primary btn-sm h-10 text-white font-medium"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-1">
              <span className="text-slate-500 text-xs">Group Name</span>
              <p className="text-slate-200 text-lg font-semibold">{chat.groupName}</p>
            </div>
          )}

          {/* Add Members Trigger */}
          {isAdmin && (
            <div className="border-t border-slate-800/80 pt-4">
              {!isAddingMembers ? (
                <button
                  onClick={() => setIsAddingMembers(true)}
                  className="btn btn-outline border-slate-800 hover:bg-slate-800 text-slate-300 btn-sm w-full flex items-center justify-center gap-1"
                >
                  <UserPlus className="size-4" />
                  Add New Members
                </button>
              ) : (
                <form onSubmit={handleAddMembersSubmit} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-semibold text-sm">Add Members</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingMembers(false)}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {/* Select Friends List */}
                  <div className="max-h-[150px] overflow-y-auto border border-slate-800 rounded-xl bg-slate-950 divide-y divide-slate-800/50">
                    {nonParticipants.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-xs">
                        All your friends are already in the group
                      </div>
                    ) : (
                      nonParticipants.map((friend) => (
                        <div
                          key={friend._id}
                          onClick={() => handleToggleFriend(friend._id)}
                          className="flex items-center justify-between px-3 py-2 hover:bg-slate-900 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={friend.profilePic}
                              alt={friend.fullname}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-slate-300 text-xs">{friend.fullname}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedFriends.includes(friend._id)}
                            onChange={() => {}}
                            className="checkbox checkbox-primary checkbox-xs"
                          />
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={adding || selectedFriends.length === 0}
                    className="btn btn-primary btn-sm text-white w-full"
                  >
                    Confirm Add
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Members List */}
          <div className="border-t border-slate-800/80 pt-4 space-y-3">
            <span className="text-slate-300 font-semibold text-sm">
              Members ({chat.participants?.length || 0})
            </span>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
              {chat.participants?.map((participant) => {
                const pId = participant._id || participant;
                const isPartAdmin = chat.admins?.includes(pId) || 
                                    chat.admins?.some(a => (a._id || a) === pId);
                const isPartSelf = pId === authUserData?._id;

                return (
                  <div key={pId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={participant.profilePic || "https://avatar.iran.liara.run/public"}
                        alt={participant.fullname}
                        className="w-7 h-7 rounded-full border border-slate-800"
                      />
                      <div className="flex flex-col">
                        <span className="text-slate-200 text-sm font-medium">
                          {participant.fullname} {isPartSelf && " (You)"}
                        </span>
                        {isPartAdmin && (
                          <span className="text-[10px] text-indigo-400 flex items-center gap-0.5 font-medium">
                            <Shield className="size-3" /> Admin
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Manage actions */}
                    {isAdmin && !isPartSelf && (
                      <button
                        onClick={() => removeMember(pId)}
                        disabled={removing}
                        className="btn btn-ghost btn-circle btn-xs text-rose-500 hover:bg-rose-500/10"
                        title="Remove member"
                      >
                        <UserMinus className="size-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex gap-2">
          {isAdmin ? (
            <button
              onClick={handleDeleteGroup}
              disabled={deleting}
              className="btn btn-error btn-sm flex-1 text-white gap-1"
            >
              <Trash className="size-4" />
              Delete Group
            </button>
          ) : null}
          <button
            onClick={handleLeaveGroup}
            disabled={removing}
            className="btn btn-outline border-slate-800 hover:bg-slate-800 text-slate-300 btn-sm flex-1 gap-1"
          >
            <LogOut className="size-4" />
            Leave Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupSettingsModal;
