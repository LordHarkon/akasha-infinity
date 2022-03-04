import { Precondition, PreconditionResult } from "@sapphire/framework";
import type { Message } from "discord.js";

export class GuildOnly extends Precondition {
    public run(message: Message): PreconditionResult {
        return message.guild === null ? this.error({ message: "This command can only be used in a server." }) : this.ok();
    }
}

declare module "@sapphire/framework" {
    export interface Preconditions {
        GuildOnly: never;
    }
}
