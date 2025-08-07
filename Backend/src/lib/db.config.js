import mongoose from "mongoose";

export const ConnectToDB = async () => {
  try {
     mongoose
      .connect(process.env.MONGODB_URI)
      .then((con)=>
      console.log(`Data Base connect succesfully...${con.connection.host}`));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
