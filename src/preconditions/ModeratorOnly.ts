import { Precondition, PreconditionResult } from "@sapphire/framework";
import type { Message } from "discord.js";

export class ModeratorOnly extends Precondition {
    public run(message: Message): PreconditionResult {
        if (
            (message.guild && message.member!.permissions.has("MANAGE_MESSAGES")) ||
            (message.guild && message.member!.permissions.has("BAN_MEMBERS")) ||
            (message.guild && message.member!.permissions.has("KICK_MEMBERS"))
        )
            return this.ok();
        return this.error({ message: "You must be a moderator to use this command." });
    }
}

declare module "@sapphire/framework" {
    export interface Preconditions {
        ModeratorOnly: never;
    }
}
