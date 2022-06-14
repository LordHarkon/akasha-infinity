// Unless explicitly defined, set NODE_ENV as development:
import type { SapphireClientOptions } from "@sapphire/framework";

process.env.NODE_ENV ??= "development";

import { srcDir } from "#lib/constants";
import { ClientOptions, Intents, PartialTypes } from "discord.js";
import { config } from "dotenv";
import { join } from "path";
import Settings from "#models/Settings";
import type { InternationalizationContext } from "@sapphire/plugin-i18next";

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

export const CLIENT_OPTIONS: SapphireClientOptions & ClientOptions = {
    intents: BOT_INTENTS,
    partials: BOT_PARTIALS,
    defaultPrefix: process.env.PREFIX || "inf.",
    baseUserDirectory: __dirname,
    caseInsensitiveCommands: true,
    caseInsensitivePrefixes: true,
    shards: "auto",
    statcord: {
        client_id: process.env.BOT_CLIENT_ID,
        key: process.env.STATCORD_KEY,
        autopost: true,
        sharding: true,
    },
    i18n: {
        fetchLanguage: async (context: InternationalizationContext) => {
            if (!context.guild) return "en-US";

            let guildSettings = await Settings.findOne({ guildId: context.guild.id });

            if (!guildSettings) {
                guildSettings = new Settings({
                    guildId: context.guild.id,
                    language: "en-US",
                });
                await guildSettings.save();
            }

            return guildSettings.language;
        },
        defaultLanguageDirectory: join(srcDir, "languages"),
    },
};
