import { Schema, model, Document } from "mongoose";

export interface ILogOptions {
    logMessageUpdates?: boolean;
    logMessageDeletions?: boolean;
    logExperienceGains?: boolean;
}

export interface IGreetingMessage {
    id: string;
    message: string;
}

export interface ISettings {
    guildId: string;
    prefix?: string;
    language?: string;
    logOptions: ILogOptions;
    experienceLogsChannel?: string;
    membersCountChannel?: string;
    generalLogsChannel?: string;
    moderationLogsChannel?: string;
    welcomeChannel?: string;
    goodbyeChannel?: string;
    suggestionsChannel?: string;
    administratorRoles?: string[];
    moderatorRoles?: string[];
    welcomeMessages?: IGreetingMessage[];
    goodbyeMessages?: IGreetingMessage[];
    customRewards?: IReward[];
}

export interface IReward {
    id: string;
    levelRequired: number;
    reward: string;
    rewardType: "money" | "item" | "role";
    disabled: boolean;
}

export type SettingsDocument = ISettings & Document;

const SettingsSchema = new Schema<SettingsDocument>({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    prefix: {
        type: String,
        default: "inf.",
    },
    language: {
        type: String,
        default: "en-US",
    },
    logOptions: {
        logMessageUpdates: {
            type: Boolean,
            default: true,
        },
        logMessageDeletions: {
            type: Boolean,
            default: true,
        },
        logExperienceGains: {
            type: Boolean,
            default: true,
        },
    },
    experienceLogsChannel: {
        type: String,
    },
    membersCountChannel: {
        type: String,
    },
    generalLogsChannel: {
        type: String,
    },
    moderationLogsChannel: {
        type: String,
    },
    welcomeChannel: {
        type: String,
    },
    goodbyeChannel: {
        type: String,
    },
    suggestionsChannel: {
        type: String,
    },
    administratorRoles: {
        type: [String],
        default: [],
    },
    moderatorRoles: {
        type: [String],
        default: [],
    },
    welcomeMessages: [
        {
            id: {
                type: String,
                required: true,
            },
            message: {
                type: String,
                required: true,
            },
        },
    ],
    goodbyeMessages: [
        {
            id: {
                type: String,
                required: true,
            },
            message: {
                type: String,
                required: true,
            },
        },
    ],
    customRewards: [
        {
            id: {
                type: String,
                required: true,
            },
            levelRequired: {
                type: Number,
                required: true,
            },
            reward: {
                // If the reward is a role, it will be the role's ID
                // If the reward is an item, it will be the item's ObjectId
                // If the reward is money, it will be the amount of money
                type: String,
                required: true,
            },
            rewardType: {
                type: String,
                enum: ["money", "item", "role"],
                required: true,
            },
            disabled: {
                type: Boolean,
                default: false,
            },
        },
    ],
});

export default model<SettingsDocument>("Settings", SettingsSchema);
