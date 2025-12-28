import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "aclp"   // 🔴 THIS IS THE KEY FIX
    });

    console.log("MongoDB Connected to DB:", conn.connection.name);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
