import mongoose from "mongoose";

export type UserAccessLevels = 1 | 2 | 3;

export interface IUserBank {
    money?: number;
    totalMoney?: number;
}

export interface IUserInventory {
    items?: [
        {
            item: {
                type: mongoose.Types.ObjectId;
                ref: "Item";
            };
            amount: number;
        },
    ];
    slots?: number;
}

export interface IUser {
    id: string;
    username: string;
    avatar?: string;
    background?: string;
    accessLevel: UserAccessLevels;
    premiumExpires?: Date;
    experience?: number;
    bank?: IUserBank;
    inventory?: IUserInventory;
}

export interface UserDocument extends IUser, Omit<mongoose.Document, "id"> {
    /** Account related */
    isPremium: () => boolean;
    addD;

    /** Inventory related */
    availableSlots: () => number;
    usedSlots: () => number;
    totalSlots: () => number;
    hasItem: (item: mongoose.Types.ObjectId) => boolean;
    addItem: (item: mongoose.Types.ObjectId, amount: number) => void;
    removeItem: (item: mongoose.Types.ObjectId, amount: number) => void;
    allOwnedItems: () => IUserInventory["items"];

    /** Level related */

    /** Bank related */
    hasEnoughMoney: (amount: number) => boolean;
    addMoney: (amount: number) => void;
    removeMoney: (amount: number) => void;
}

const UserSchema = new mongoose.Schema<UserDocument>({
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
    premiumExpires: {
        type: Date,
        default: null,
    },
});

UserSchema.methods.isPremium = function () {
    return this.premium >= new Date();
};

export default mongoose.model<UserDocument>("User", UserSchema);
