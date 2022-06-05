import mongoose from "mongoose";
import type { UserDocument } from "./User";

export type AvailableGamesType = "roulette" | "slots" | "rps" | "rpsls";

export type WarningSeverityType = "low" | "medium" | "high";

export interface IGameData {
    played?: number;
    won?: number;
    lost?: number;
}

export interface IGameDataMoney extends IGameData {
    moneyWon?: number;
    moneyLost?: number;
}

export interface IGuildUserStats {
    messages?: number;
    games?: {
        roulette?: IGameDataMoney;
        slots?: IGameDataMoney;
        rps?: IGameData;
        rpsls?: IGameData;
    };
}

export interface IGuildUserBank {
    money?: number;
    totalMoney?: number;
}

export interface IGuildUserInventory {
    items?: [
        {
            item: mongoose.Types.ObjectId;
            amount: number;
        },
    ];
    slots?: number;
}

export interface IGuildUserSettings {
    blacklist?: Array<string>;
}

export interface IWarning {
    id?: string;
    reason?: string;
    expires?: Date;
    severity?: WarningSeverityType;
}

export interface IGuildUserModeration {
    warnings?: IWarning[];
    kicks?: number;
    bans?: number;
}

export interface IGuildUser {
    user: mongoose.PopulatedDoc<UserDocument>;
    guildId: string;
    experience?: number;
    joined?: boolean;
    collectedRewards?: string[];
    stats?: IGuildUserStats;
    bank?: IGuildUserBank;
    inventory?: IGuildUserInventory;
    settings?: IGuildUserSettings;
    moderation?: IGuildUserModeration;
}

export type GuildUserDocument = IGuildUser & mongoose.Document;

const GuildUserSchema = new mongoose.Schema<GuildUserDocument>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        default: 0,
    },
    joined: {
        type: Boolean,
        default: true,
    },
    collectedRewards: {
        type: [String],
        default: [],
    },
    stats: {
        messages: {
            type: Number,
            default: 0,
        },
        games: {
            roulette: {
                played: {
                    type: Number,
                    default: 0,
                },
                won: {
                    type: Number,
                    default: 0,
                },
                lost: {
                    type: Number,
                    default: 0,
                },
                moneyWon: {
                    type: Number,
                    default: 0,
                },
                moneyLost: {
                    type: Number,
                    default: 0,
                },
            },
            rps: {
                played: {
                    type: Number,
                    default: 0,
                },
                won: {
                    type: Number,
                    default: 0,
                },
                lost: {
                    type: Number,
                    default: 0,
                },
            },
            rpsls: {
                played: {
                    type: Number,
                    default: 0,
                },
                won: {
                    type: Number,
                    default: 0,
                },
                lost: {
                    type: Number,
                    default: 0,
                },
            },
            slots: {
                played: {
                    type: Number,
                    default: 0,
                },
                won: {
                    type: Number,
                    default: 0,
                },
                lost: {
                    type: Number,
                    default: 0,
                },
                moneyWon: {
                    type: Number,
                    default: 0,
                },
                moneyLost: {
                    type: Number,
                    default: 0,
                },
            },
        },
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
                    type: mongoose.Types.ObjectId,
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
            // TODO: come back in the future and update this maybe?
            // TODO: add items that can expand the inventory size
            default: 10,
        },
    },
    settings: {
        // Note: If the user has certain commands blacklisted by an admin
        blacklist: {
            type: [String],
            default: [],
        },
    },
    moderation: {
        warnings: [
            {
                id: {
                    type: String,
                    required: true,
                },
                reason: {
                    type: String,
                    required: true,
                },
                expires: {
                    type: Date,
                },
                severity: {
                    type: String,
                    default: "low",
                    enum: ["low", "medium", "high"],
                },
            },
        ],
        kicks: {
            type: Number,
            default: 0,
        },
        bans: {
            type: Number,
            default: 0,
        },
    },
});

GuildUserSchema.index({ user: 1, guildId: 1 }, { unique: true });

export default mongoose.model<GuildUserDocument>("GuildUser", GuildUserSchema);
