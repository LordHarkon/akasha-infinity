import { Document, model, Schema } from "mongoose";

export type UserAccessLevels = 1 | 2 | 3;

export interface IUser {
    id: string;
    username: string;
    avatar?: string;
    background?: string;
    accessLevel: UserAccessLevels;
    premium?: boolean;
    premiumExpires?: Date;
}

export type UserDocument = IUser & Document;

const UserSchema = new Schema<UserDocument>({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "",
    },
    background: {
        type: String,
        default: "",
    },
    accessLevel: {
        type: Number,
        min: 1,
        max: 3,
        default: 1,
    },
    premium: {
        type: Boolean,
        default: false,
    },
    premiumExpires: {
        type: Date,
        default: null,
    },
});

export default model<UserDocument>("User", UserSchema);
