import { container } from "@sapphire/pieces";
import mongoose, { ConnectOptions } from "mongoose";

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true,
            // useFindAndModify: true,
        } as ConnectOptions);
    } catch (err) {
        container.logger.fatal("Error connecting to database!");
        console.error(err.message);
        // Exit process upon failure
        process.exit(1);
    }
};

export default connectDB;
