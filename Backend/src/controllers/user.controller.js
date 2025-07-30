import friendRequestModel from "../models/friendRequest.model.js";
import user from "../models/user.model.js";

// this code recommend the new friends to user
export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await user.find({
      $and: [
        { _id: { $ne: currentUserId } }, //exclued current user
        { _id: { $nin: currentUser.friends } }, //exclued current user friend
        { isOnboarded: true },
      ],
    });

    res.status(200).json({ success: true, recommendedUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// this code get all friends
export async function getMyFriends(req, res) {
  try {
    const users = await user
      .findById(req.user.id)
      .select("friends")
      .populate(
        "friends",
        "fullname email profilePic nativeLanguage learningLanguage"
      );

    res.status(200).json({ success: true, friends: users.friends });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// send to user friend request
export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return res.status(400).json({
        success: false,
        message: "You can't send a friend request to yourself",
      });
    }

    const recipientUser = await user.findById(recipientId);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already friends
    if (recipientUser.friends.includes(myId)) {
      return res.status(400).json({
        success: false,
        message: "You are already friends with this user",
      });
    }

    // Check if a friend request already exists
    const existingFriendRequest = await friendRequestModel.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingFriendRequest) {
      return res.status(400).json({
        success: false,
        message: "Friend request already exists",
      });
    }

    // Create friend request
    const friendRequest = await friendRequestModel.create({
      sender: myId,
      recipient: recipientId,
    });

    return res.status(200).json({
      success: true,
      friendRequest,
    });
  } catch (err) {
    console.error("Error sending friend request:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


// accept request
export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await friendRequestModel.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    // Verify that the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only accept friend requests sent to you",
      });
    }

    // Update the friend request status
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add each user to the other's friends list
    await user.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await user.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({
      success: true,
      message: "Friend request accepted",
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// reject request
export async function rejectFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    // Find the friend request by ID
    const friendRequest = await friendRequestModel.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    // Ensure the current user is the recipient of the request
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only reject friend requests sent to you",
      });
    }

    // Rejecting already processed request is not allowed
    if (["accepted", "rejected"].includes(friendRequest.status)) {
      return res.status(400).json({
        success: false,
        message: `Friend request already ${friendRequest.status}`,
      });
    }

    // Automatically delete the friend request upon rejection
    await friendRequestModel.findOneAndDelete({ _id: requestId });

    return res.status(200).json({
      success: true,
      message: "Friend request rejected and deleted",
    });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


export async function getFriendRequest(req, res) {
  try {
    // Incoming pending requests to the current user
    const incomingReqs = await friendRequestModel
      .find({
        recipient: req.user.id,
        status: "pending",
      })
      .populate("sender", "fullname profilePic nativeLanguage learningLanguage");

    // Friend requests sent by the current user that were accepted
    const acceptRequest = await friendRequestModel
      .find({
        sender: req.user.id,
        status: "accepted",
      })
      .populate("recipient", "fullname profilePic");

    res.status(200).json({ incomingReqs, acceptRequest });
  } catch (error) {
    console.error("Error getting friend request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


export async function getOutGoningFriendRequest(req, res) {
  try {
    const outGoningRequest = await friendRequestModel
      .find({
        sender: req.user.id,
        status: "pending",
      })
      .populate(
        "recipient",
        "fullname profilePic nativeLanguage learningLanguage"
      );

    res.status(200).json(outGoningRequest);
  } catch (error) {
    console.error("Error get friend request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


// cancel request

export async function cancelFriendRequest(req, res) {
  const myId = req.user.id;
  const { id: recipientId } = req.params;

  const deleted = await friendRequestModel.findOneAndDelete({
    sender: myId,
    recipient: recipientId,
    status: "pending",
  });

  if (!deleted) return res.status(404).json({ message: "No request to cancel" });

  res.status(200).json({ success: true, message: "Friend request canceled" });
}

// unfriend

export async function unfriendUser(req, res) {
  try {
    const myId = req.user.id;
    const { id: friendId } = req.params;

    // 1. Remove each other from friends list
    await user.findByIdAndUpdate(myId, { $pull: { friends: friendId } });
    await user.findByIdAndUpdate(friendId, { $pull: { friends: myId } });

    // 2. Delete the accepted friend request from DB (if exists)
    await friendRequestModel.findOneAndDelete({
      $or: [
        { sender: myId, recipient: friendId, status: "accepted" },
        { sender: friendId, recipient: myId, status: "accepted" },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Unfriended successfully and friend record removed from DB",
    });
  } catch (error) {
    console.error("Error unfriending user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
