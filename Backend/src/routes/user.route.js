import express from "express";
import { protectedRoute } from "../middleware/auth.middleare.js";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  getFriendProfiles,
  getFriendRequest,
  getMyFriends,
  getOutGoningFriendRequest,
  getRecommendedUsers,
  getUserProfile,
  rejectFriendRequest,
  sendFriendRequest,
  unfriendUser,
} from "../controllers/user.controller.js";
const router = express.Router();

// applay to all routes auth middleware
router.use(protectedRoute);

router.get("/", getRecommendedUsers);

router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);

router.put("/friend-request/:id/accept", acceptFriendRequest);

router.put("/friend-request/:id/reject", rejectFriendRequest);

router.delete("/friend-request/:id/cancel",cancelFriendRequest)

router.delete('/friend/:id',unfriendUser)

router.get("/friend-requests",getFriendRequest)

router.get("/outgoing-friend-requests",getOutGoningFriendRequest)

router.get('/friend-profile/:id', getFriendProfiles);


router.get("/user-profile", getUserProfile);


export default router;
