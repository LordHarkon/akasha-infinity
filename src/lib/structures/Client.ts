import { BOT_INTENTS, BOT_PARTIALS } from "../../config";
import Settings from "#models/Settings";
import { SapphireClient, SapphireClientOptions, container } from "@sapphire/framework";
import type { InternationalizationContext } from "@sapphire/plugin-i18next";
import { join } from "path";
import { TaskStore } from "./TaskStore";

export class Client extends SapphireClient {
    constructor(options?: SapphireClientOptions) {
        super({
            ...options,
            intents: BOT_INTENTS,
            partials: BOT_PARTIALS,
            defaultPrefix: process.env.PREFIX || "inf.",
            baseUserDirectory: join(__dirname, "..", ".."),
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
                defaultLanguageDirectory: join(__dirname, "..", "..", "languages"),
            },
        });

        this.stores.register(new TaskStore());
        container.client = this;
    }

    public fetchprefix = (): string => process.env.PREFIX || "inf.";
}
