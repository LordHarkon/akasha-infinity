import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true,
      // useFindAndModify: true,
    } as mongoose.ConnectOptions);
  } catch (err) {
    console.error(err.message);
    // Exit process upon failure
    process.exit(1);
  }
};

export default connectDB;
