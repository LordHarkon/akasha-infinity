import { SapphireClient, container } from "@sapphire/framework";
import { TaskStore } from "#structures/TaskStore";
import connectDB from "#lib/databaseUtilities";

export class Client extends SapphireClient {
    public fetchprefix = (): string => process.env.PREFIX || "inf.";

    public override async login(token?: string) {
        container.logger.info("Setting up additional settings...");
        this.stores.register(new TaskStore());
        container.client = this;

        container.logger.info("Connecting to the database...");
        await connectDB();

        container.logger.info("Logging into Discord...");
        return super.login(token);
    }
}
