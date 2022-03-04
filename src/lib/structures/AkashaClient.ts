import { BOT_INTENTS, BOT_PARTIALS } from "#root/config";
import { BucketScope, SapphireClient, SapphireClientOptions, container } from "@sapphire/framework";
import { join } from "path";
import { TaskStore } from "./TaskStore";

export class AkashaClient extends SapphireClient {
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
            defaultCooldown: {
                delay: 1,
                scope: BucketScope.User,
                filteredUsers: process.env.OWNERS?.split(",") ?? [],
            },
        });

        this.stores.register(new TaskStore());
        // container.database =
        container.client = this;
    }

    public fetchprefix = (): string => process.env.PREFIX || "inf.";
}
