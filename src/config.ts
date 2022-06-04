// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= "development";

import { srcDir } from "#lib/constants";
import { Intents, PartialTypes } from "discord.js";
import { config } from "dotenv";
import { join } from "path";

// Config dotenv
config({ path: join(srcDir, ".env") });

export const BOT_INTENTS: number[] = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
];

export const BOT_PARTIALS: PartialTypes[] = ["MESSAGE", "CHANNEL", "GUILD_MEMBER"];
