import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Missing stream API");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStramUSer = async function (userData) {
  if (!userData.id) {
    console.log(userData.id)
    throw new Error("User ID is required");
  }
  try {
    await streamClient.upsertUser(userData);
    return userData;
  } catch (error) {
    console.error("Error creating stream user", error);
  }
};

export const generateStreamToken = async function (userId) {
  try {
    const userIdString = userId.toString();
    return streamClient.createToken(userIdString);
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw new Error("Failed to generate Stream token");
  }
};

