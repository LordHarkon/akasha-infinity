import { Schema, model, Document } from "mongoose";

interface Command extends Document {
    command: string;
    uses: number;
}

const CommandSchema = new Schema<Command>({
    command: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    uses: {
        type: Number,
        default: 0,
    },
});

export default model<Command>("Command", CommandSchema);
