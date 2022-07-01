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

export interface IMethodResult {
    success: boolean;
    message?: string;
    value?: any;
}

export interface UserDocument extends IUser, Omit<mongoose.Document, "id"> {
    /** Account related */
    isPremium: () => IMethodResult;
    addPremiumDays: (days: number) => Promise<IMethodResult>;

    /** Inventory related */
    availableSlots: () => IMethodResult;
    usedSlots: () => IMethodResult;
    totalSlots: () => IMethodResult;
    hasItem: (item: mongoose.Types.ObjectId) => IMethodResult;
    addItem: (item: mongoose.Types.ObjectId, amount: number) => IMethodResult;
    removeItem: (item: mongoose.Types.ObjectId, amount: number) => IMethodResult;
    allOwnedItems: () => IMethodResult;

    /** Level related */
    level: () => IMethodResult;
    experience: () => IMethodResult;
    totalExperience: () => IMethodResult;
    addExperience: (amount: number) => IMethodResult;
    removeExperience: (amount: number) => IMethodResult;
    nextLevelExperience: () => IMethodResult;

    /** Bank related */
    hasEnoughMoney: (amount: number) => IMethodResult;
    addMoney: (amount: number) => IMethodResult;
    removeMoney: (amount: number) => IMethodResult;
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
    experience: {
        type: Number,
        default: 0,
    },
    bank: {
        money: {
            type: Number,
            default: 0,
        },
        totalMoney: {
            type: Number,
            default: 0,
        },
    },
    inventory: {
        items: [
            {
                item: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Item",
                },
                amount: {
                    type: Number,
                    default: 1,
                },
            },
        ],
        slots: {
            type: Number,
            // TODO: Come back in the future and update this maybe?
            // TODO: Add items that can expand the inventory size, or maybe premium offering higher inventory size?
            default: 10,
        },
    },
});

/**
 * Account related methods
 */
UserSchema.methods.isPremium = function (): IMethodResult {
    return {
        success: true,
        value: this.premium >= new Date(),
    };
};

UserSchema.methods.addPremiumDays = async function (days: number): Promise<IMethodResult> {
    this.premiumExpires = new Date(this.premiumExpires.getTime() + days * 24 * 60 * 60 * 1000);
    await this.save();

    return {
        success: true,
    };
};

/**
 * Inventory related methods
 */
UserSchema.methods.availableSlots = function (): IMethodResult {
    return {
        success: true,
        value: this.inventory.slots - this.usedSlots(),
    };
};

UserSchema.methods.usedSlots = function (): IMethodResult {
    return {
        success: true,
        value: this.inventory.items.length,
    };
};

UserSchema.methods.totalSlots = function (): IMethodResult {
    return {
        success: true,
        value: this.inventory.slots,
    };
};

UserSchema.methods.hasItem = function (item: mongoose.Types.ObjectId): IMethodResult {
    return {
        success: true,
        value: this.inventory.items.some((i) => i.item == item),
    };
};

UserSchema.methods.addItem = function (item: mongoose.Types.ObjectId, amount: number): IMethodResult {
    if (this.hasItem(item)) {
        this.inventory.items.find((i) => i.item == item).amount += amount;
    } else {
        this.inventory.items.push({
            item,
            amount,
        });
    }

    return {
        success: true,
    };
};

UserSchema.methods.removeItem = function (item: mongoose.Types.ObjectId, amount: number): IMethodResult {
    const itemIndex = this.inventory.items.findIndex((i) => i.item == item);

    if (itemIndex == -1) {
        return {
            success: false,
            message: "Item not found",
        };
    }

    if (this.inventory.items[itemIndex].amount <= amount) {
        this.inventory.items.splice(itemIndex, 1);
    } else {
        this.inventory.items[itemIndex].amount -= amount;
    }

    return {
        success: true,
    };
};

UserSchema.methods.allOwnedItems = function (includeCount?: boolean): IMethodResult {
    // TODO: Come back to this and maybe populate the 'item' field?
    return includeCount
        ? {
              success: true,
              value: this.inventory.items.map((i) => i.item),
          }
        : {
              success: true,
              value: this.inventory.items,
          };
};

/**
 * Level related methods
 */
UserSchema.methods.level = function (): IMethodResult {};

export default mongoose.model<UserDocument>("User", UserSchema);
