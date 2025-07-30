import mongoose from "mongoose";

export const ConnectToDB = async () => {
  try {
    const coon = await mongoose
      .connect(process.env.MONGODB_URI)
      console.log(`Data Base connect succesfully...` , `Connection : ${coon.connection.host}`)
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
