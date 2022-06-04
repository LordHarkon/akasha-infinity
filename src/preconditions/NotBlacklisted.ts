import User from "#lib/database/User";
import type { Command } from "#lib/structures/Command";
// import { ApplyOptions } from "@sapphire/decorators";
import { AsyncPreconditionResult, Precondition } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import type { Message } from "discord.js";

// @ApplyOptions<Precondition.Options>({
// position: 1,
// })
export class NotBlacklisted extends Precondition {
    public async run(message: Message, command: Command): AsyncPreconditionResult {
        const user = new User(message.author, message.guild);
        await user.init();

        if (user.isBlacklisted(command.name)) return this.error({ message: await resolveKey(message, "preconditions/NotBlacklisted:error") });
        return this.ok();
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        NotBlacklisted: never;
    }
}
