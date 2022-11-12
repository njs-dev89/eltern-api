import mongoose from "mongoose";

const connectDB = async (callback) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    callback();
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
};

export default connectDB;
