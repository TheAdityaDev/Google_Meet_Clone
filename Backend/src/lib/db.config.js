import mongoose from "mongoose";
import 'dotenv/config'

export const ConnectToDB = async () => {
  try {
    mongoose
      .connect(process.env.MONGODB_URI)
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
