import { AsyncPreconditionResult, Precondition } from "@sapphire/framework";
import type { Message } from "discord.js";
import Settings from "#database/Settings";
import { checkForRoles } from "#lib/utils";
import { resolveKey } from "@sapphire/plugin-i18next";

export class ModeratorOnly extends Precondition {
    public async run(message: Message): AsyncPreconditionResult {
        const guild = new Settings(message.guild);
        await guild.init();

        if (message.guild && checkForRoles(message.member, guild.moderatorRoles)) return this.ok();

        if (message.guild && checkForRoles(message.member, guild.administratorRoles)) return this.ok();

        // if (message.guild && hasPermissions(message.member, ["MODERATE_MEMBERS", "BAN_MEMBERS", "KICK_MEMBERS"])) return this.ok();

        return this.error({ message: await resolveKey(message, "preconditions/ModeratorOnly:error") });
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        ModeratorOnly: never;
    }
}
