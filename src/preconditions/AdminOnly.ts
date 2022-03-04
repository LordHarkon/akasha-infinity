import { Precondition, PreconditionResult } from "@sapphire/framework";
import type { Message } from "discord.js";

export class AdminOnly extends Precondition {
    public run(message: Message): PreconditionResult {
        if (
            (message.guild && message.member!.permissions.has("ADMINISTRATOR")) ||
            (message.guild && message.member!.permissions.has("MANAGE_GUILD"))
        )
            return this.ok();
        return this.error({ message: "You must be an administrator to use this command." });
    }
}

declare module "@sapphire/framework" {
    export interface Preconditions {
        AdminOnly: never;
    }
}
