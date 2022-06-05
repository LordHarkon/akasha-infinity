import { Command } from "#lib/structures/Command";
import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import type { CommandOptions } from "#typings/index";
import type { GuildMember, Message } from "discord.js";
import { Args, Resolvers } from "@sapphire/framework";
import { resolveKey, sendLocalized } from "@sapphire/plugin-i18next";
import Settings from "#lib/database/Settings";
import { Embed } from "#lib/structures/Embed";

@ApplyOptions<CommandOptions>({
    name: "kick",
    examples: ["kick @user", "kick user#0001", "kick user"],
    usage: "<user> [reason<512>]",
    preconditions: [
        "GuildOnly",
        {
            name: "CustomCooldown",
            context: {
                delay: 1000,
            },
        },
    ],
    requiredClientPermissions: ["KICK_MEMBERS", "EMBED_LINKS"],
    requiredUserPermissions: ["KICK_MEMBERS"],
})
export class KickCommand extends Command {
    @RequiresGuildContext(async (message: Message) => await sendLocalized(message, "errors:guildOnly"))
    public async messageRun(message: Message, args: Args): Promise<Message | void> {
        const pickedMember: GuildMember | null = await args.pick("member").catch(() => null);
        const reason: string | null = await args.rest("string").catch(() => "");

        if (!pickedMember) {
            return await sendLocalized(message, "commands/kick:noMember");
        } else if (pickedMember.id === message.author.id) {
            return await sendLocalized(message, "commands/kick:noSelf");
        }

        if (pickedMember.permissions.has("ADMINISTRATOR", true)) {
            return await sendLocalized(message, "commands/kick:noPermission");
        }

        if (!reason) {
            return await sendLocalized(message, "commands/kick:noReason");
        } else if (reason.length > 512) {
            return await sendLocalized(message, "commands/kick:tooLong");
        }

        const _settings = new Settings(message.guild);
        await _settings.init();

        try {
            await pickedMember.kick(reason);

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
                        await resolveKey(message, "commands/kick:successEmbed", {
                            member: `${pickedMember.user.tag} (${pickedMember.id})`,
                            reason,
                        }),
                    )
                    .setColor("#ff0000");

                channel.send({ embeds: [embed] });
            }

            return await sendLocalized(message, {
                keys: "commands/kick:success",
                formatOptions: {
                    member: pickedMember.user.tag,
                },
            });
        } catch (error) {
            console.log(error);
            return await sendLocalized(message, {
                keys: "commands/kick:error",
                formatOptions: {
                    member: pickedMember.user.tag,
                },
            });
        }
    }
}
