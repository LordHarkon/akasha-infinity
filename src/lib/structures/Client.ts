import { SapphireClient, container, SapphireClientOptions } from "@sapphire/framework";
import { TaskStore } from "#structures/TaskStore";
import connectDB from "#lib/databaseUtilities";
import type { ClientOptions } from "discord.js";

export class Client extends SapphireClient {
    public constructor(options: SapphireClientOptions & ClientOptions) {
        super(options);

        this.stores.register(new TaskStore());
        container.client = this;
    }

    public override fetchPrefix = (): string => process.env.PREFIX || "inf.";

    public override async login(token?: string) {
        container.logger.info("Connecting to the database...");
        await connectDB();

        container.logger.info("Logging into Discord...");
        return super.login(token);
    }
}
