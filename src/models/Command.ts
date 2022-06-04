import { Schema, model, Document } from "mongoose";

export interface ICommand extends Document {
    command: string;
    uses: number;
    guildId: string;
    guildName: string;
}

export type CommandDocument = ICommand & Document;

const CommandSchema = new Schema<CommandDocument>({
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

export default model<CommandDocument>("Command", CommandSchema);
