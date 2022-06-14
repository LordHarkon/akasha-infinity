import { SapphireClient, container, SapphireClientOptions, SapphirePrefix } from "@sapphire/framework";
import { TaskStore } from "#structures/TaskStore";
import connectDB from "#lib/databaseUtilities";
import type { ClientOptions } from "discord.js";
import type { Message } from "discord.js";
import { isGuildBasedChannel } from "@sapphire/discord.js-utilities";
import Settings from "#database/Settings";

export class Client extends SapphireClient {
    public constructor(options: SapphireClientOptions & ClientOptions) {
        super(options);

        this.stores.register(new TaskStore());
        container.client = this;
    }

    /**
     * Retrieves the prefix for bot to respond to.
     * @param message The message to determine the prefix for.
     */
    public override fetchPrefix = async (message: Message): Promise<SapphirePrefix> => {
        if (isGuildBasedChannel(message.channel)) {
            const settings = new Settings(message.guild);
            await settings.init();

            // Return guild custom prefix or default prefix if none is set
            return settings.prefix ?? process.env.PREFIX ?? "inf.";
        }

        // Return default prefix if not in a guild and no prefix
        return [process.env.PREFIX ?? "inf.", ""];
    };

    public override async login(token?: string) {
        container.logger.info("Connecting to the database...");
        await connectDB();

        container.logger.info("Logging into Discord...");
        return super.login(token);
    }
}
