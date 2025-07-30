import { generateStreamToken } from "../lib/stream.config.js";

export async function getStreamToken(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    const token = await generateStreamToken(req.user.id);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error getting Stream token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
