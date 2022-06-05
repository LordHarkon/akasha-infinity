import "#lib/setup";
import { Client } from "#lib/structures/Client";
import { BOT_INTENTS, BOT_PARTIALS } from "#config";
import { join } from "path";
import type { InternationalizationContext } from "@sapphire/plugin-i18next";
import Settings from "#models/Settings";

const client = new Client({
    intents: BOT_INTENTS,
    partials: BOT_PARTIALS,
    defaultPrefix: process.env.PREFIX || "inf.",
    baseUserDirectory: "./",
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
        defaultLanguageDirectory: join(__dirname, "..", "src", "languages"),
    },
});

// TODO: Add premium system, add redeemable codes, add a way to get a code, add a way to generate codes
// TODO: Add a command that gives the selected role when reacting to the message from the bot
// TODO: Make a command `rewards` with the default being to see the rewards and maybe a subcommand `rewards list` which the command defaults to,
// *and a subcommand `rewards add` which adds a reward, but only works for someone with `ADMINISTRATOR` or `MANAGE_GUILD` permissions
// TODO: Add a chance for people to get random titles at certain levels. Make the titles themselves be random, using lists of options.
// TODO: Add command to re-give the role rewards to a user. Cooldown of 1 hour or maybe 1 day.
// TODO: Add command to create multiple bank accounts for users. Each account will be tied to a user, or be anonymous. Upon the creation of the bank account, the user will receive a pin code to use for transferring money and stuff.
// TODO: Add a trivia command with prizes maybe some fens or experience. The bot sends and embed with the questions and the answers. And the user reacts to the embed with the correct answer.

(async () => {
    try {
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        client.logger.fatal(error);
        client.destroy();
        process.exit(1);
    }
})();
