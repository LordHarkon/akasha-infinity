import mongoose from "mongoose";

export interface ICommand extends mongoose.Document {
    command: string;
    uses: number;
    guildId: string;
    guildName: string;
}

export type CommandDocument = ICommand & mongoose.Document;

const CommandSchema = new mongoose.Schema<CommandDocument>({
    command: {
        type: String,
        required: true,
        index: true,
    },
    uses: {
        type: Number,
        default: 0,
    },
    guildId: {
        type: String,
    },
    guildName: {
        type: String,
    },
});

CommandSchema.index({ command: 1 }, { unique: true });
CommandSchema.index({ command: 1, guildId: 1 }, { unique: true });

export default mongoose.model<CommandDocument>("Command", CommandSchema);
