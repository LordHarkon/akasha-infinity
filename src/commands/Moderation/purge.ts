import { Command } from "#lib/structures/Command";
import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import type { CommandOptions } from "#typings/index";
import type { GuildMember, Message, NewsChannel, TextChannel, ThreadChannel } from "discord.js";
import { Args } from "@sapphire/framework";
import { resolveKey, sendLocalized } from "@sapphire/plugin-i18next";

@ApplyOptions<CommandOptions>({
    name: "purge",
    examples: ["purge 22", "purge 1 @TestUser", "purge 500 TestUser"],
    usage: "<messages<1,500>> [user]",
    preconditions: ["GuildOnly"],
    cooldown: {
        delay: 1000,
    },
    requiredClientPermissions: ["MANAGE_MESSAGES"],
    requiredUserPermissions: ["MANAGE_MESSAGES"],
})
export class PurgeCommand extends Command {
    @RequiresGuildContext(async (message: Message) => await sendLocalized(message, "errors:guildOnly"))
    public async messageRun(message: Message, args: Args): Promise<Message | void> {
        const messagesNumber: number = await args.pick("integer").catch(() => 0);
        const target: GuildMember | null = await args.pick("member").catch(() => null);
        const messages = await message.channel.messages.fetch();

        if (messagesNumber < 1) {
            return await sendLocalized(message, "commands/purge:noMessages");
        } else if (messagesNumber > 500) {
            return await sendLocalized(message, "commands/purge:tooManyMessages");
        }

        try {
            let toBeDeleted = null;

            if (target) {
                toBeDeleted = messages
                    .filter((m) => m.author.id === target.id)
                    .toJSON()
                    .splice(0, messagesNumber);
            } else {
                toBeDeleted = messages.toJSON().splice(0, messagesNumber);
            }

            await (message.channel as TextChannel | ThreadChannel | NewsChannel).bulkDelete(toBeDeleted);

            const success = await sendLocalized(message, {
                keys: "commands/purge:success",
                formatOptions: {
                    messages: messagesNumber,
                },
            });

            setTimeout(() => success.delete(), 5000);

            return success;
        } catch (error) {
            let errorMessage: string | null = null;
            if (error.code === 50034) errorMessage = await resolveKey(message, "commands/purge:14dayLimit");
            else errorMessage = await resolveKey(message, "errors:unknown");
            return await sendLocalized(message, {
                keys: "commands/purge:error",
                formatOptions: {
                    error: errorMessage,
                },
            });
        }
    }
}
