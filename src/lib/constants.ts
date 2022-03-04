import { join } from "path";

export const rootDir = join(__dirname, "..", "..");
export const srcDir = join(rootDir, "src");

export const RandomLoadingMessage = [
    "Computing...",
    "Thinking...",
    "Cooking some food",
    "Give me a moment",
    "Loading...",
    "Scrambling alien radio transmissions...",
    "Flipping the meat",
    "Eating milk",
    "Drinking cereal",
];

export enum premiumTiers {
    NONE = 0,
    TIER_1 = 1,
    TIER_2 = 2,
    TIER_3 = 3,
}

export enum verificationLevels {
    NONE = "None",
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High",
    VERY_HIGH = "Very High",
}

export enum explicitContentFilterLevels {
    DISABLED = "Disabled",
    MEMBERS_WITHOUT_ROLES = "Members without Roles",
    ALL_MEMBERS = "All Members",
}

export enum nsfwLevels {
    DEFAULT = "Default",
    EXPLICIT = "Explicit",
    SAFE = "Safe",
    AGE_RESTRICTED = "Age Restricted",
}
