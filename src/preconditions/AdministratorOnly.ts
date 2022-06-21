import { AsyncPreconditionResult, Precondition } from "@sapphire/framework";
import type { Message } from "discord.js";
import { resolveKey } from "@sapphire/plugin-i18next";
import Settings from "#database/Settings";
import { checkForRoles, hasPermissions } from "#lib/utils";

export class AdministratorOnly extends Precondition {
    public async run(message: Message): AsyncPreconditionResult {
        const guild = new Settings(message.guild);
        await guild.init();

        if (message.guild && checkForRoles(message.member, guild.administratorRoles)) return this.ok();

        if (message.guild && hasPermissions(message.member, ["MANAGE_GUILD", "ADMINISTRATOR"])) return this.ok();

        return this.error({ message: await resolveKey(message, "preconditions/AdministratorOnly:error") });
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        AdministratorOnly: never;
    }
}
