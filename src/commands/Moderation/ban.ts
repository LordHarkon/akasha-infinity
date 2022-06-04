import { Command } from "#lib/structures/Command";
import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import type { CommandOptions } from "#typings/index";
import type { GuildMember, Message } from "discord.js";
import { Args, Resolvers } from "@sapphire/framework";
import { resolveKey, sendLocalized } from "@sapphire/plugin-i18next";
import Settings from "#lib/database/Settings";
import { Embed } from "#lib/structures/Embed";

@ApplyOptions<CommandOptions>({
    name: "ban",
    examples: ["ban @TestUser 2 reason here", "ban TestUser#0001 reason here", "ban TestUser reason here"],
    usage: "<user> <reason<512>>",
    preconditions: ["GuildOnly"],
    cooldown: {
        delay: 1000,
    },
    requiredClientPermissions: ["BAN_MEMBERS", "EMBED_LINKS"],
    requiredUserPermissions: ["BAN_MEMBERS"],
})
export class BanCommand extends Command {
    @RequiresGuildContext(async (message: Message) => await sendLocalized(message, "errors:guildOnly"))
    public async messageRun(message: Message, args: Args): Promise<Message | void> {
        const pickedMember: GuildMember | null = await args.pick("member").catch(() => null);
        const reason: string | null = await args.rest("string").catch(() => "");
        const days: number = await args.pick("integer").catch(() => 0);

        if (!pickedMember) {
            return await sendLocalized(message, "commands/ban:noMember");
        } else if (pickedMember.id === message.author.id) {
            return await sendLocalized(message, "commands/ban:noSelf");
        }

        if (pickedMember.permissions.has("ADMINISTRATOR", true)) {
            return await sendLocalized(message, "commands/ban:noPermission");
        }

        if (!reason) {
            return await sendLocalized(message, "commands/ban:noReason");
        } else if (reason.length > 512) {
            return await sendLocalized(message, "commands/ban:tooLong");
        }

        if (days < 0 || days > 7) {
            return await sendLocalized(message, "commands/ban:incorrectTime");
        }

        const _settings = new Settings(message.guild);
        await _settings.init();

        try {
            await pickedMember.ban({
                reason,
                days,
            });

            if (_settings.moderationLogsChannel) {
                const channel = Resolvers.resolveGuildTextChannel(_settings.moderationLogsChannel, message.guild).value;
                const embed = new Embed()
                    .setAuthor({
                        name: `${message.author.username} (${message.author.id})`,
                        iconURL: message.author.avatarURL({
                            dynamic: true,
                        }),
                    })
                    .setDescription(
                        await resolveKey(message, "commands/ban:successEmbed", {
                            member: `${pickedMember.user.tag} (${pickedMember.id})`,
                            reason,
                            days,
                        }),
                    )
                    .setColor("#ff0000");

                channel.send({ embeds: [embed] });
            }

            return await sendLocalized(message, {
                keys: "commands/ban:success",
                formatOptions: {
                    member: pickedMember.user.tag,
                },
            });
        } catch (error) {
            console.log(error);
            return await sendLocalized(message, {
                keys: "commands/ban:error",
                formatOptions: {
                    member: pickedMember.user.tag,
                },
            });
        }
    }
}
