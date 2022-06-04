import { Command } from "#lib/structures/Command";
import { ApplyOptions } from "@sapphire/decorators";
import type { CommandOptions } from "#typings/index";
import type { GuildMember, Message, Role } from "discord.js";
import { Embed } from "#lib/structures/Embed";
import type { Args } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { nameThatColor } from "#lib/utils";

@ApplyOptions<CommandOptions>({
    name: "userinfo",
    examples: ["userinfo"],
    cooldown: {
        delay: 1000,
    },
    requiredClientPermissions: ["EMBED_LINKS"],
})
export class UserInfoCommand extends Command {
    public override async messageRun(message: Message, args: Args) {
        const member: GuildMember = await args.pick("member").catch(() => message.member);
        const hexAccentColor = (await member.user.fetch(true)).hexAccentColor;

        const embed = new Embed()
            .setTitle(member.user.tag)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setDescription(
                await resolveKey(message, "commands/userinfo:success", {
                    id: member.id,
                    username: member.user.username,
                    discriminator: member.user.discriminator,
                    bot: member.user.bot ? "Yes" : "No",
                    created: `<t:${(member.user.createdTimestamp / 1000).toFixed(0)}:d> (<t:${(member.user.createdTimestamp / 1000).toFixed(0)}:R>)`,
                    hoistRole: member.roles.hoist ? member.roles.hoist.name : "None",
                    owner: member.guild.ownerId === member.id ? "Yes" : "No",
                    nickname: member.nickname || "None",
                    joined: `<t:${(member.joinedTimestamp / 1000).toFixed(0)}:d> (<t:${(member.joinedTimestamp / 1000).toFixed(0)}:R>)`,
                    roles: member.roles.cache.size,
                    color: nameThatColor.name(hexAccentColor || "#FFFFFF")[1],
                    _roles: member.roles.cache
                        .map((role: Role) => {
                            if (role.name === "@everyone") return null;
                            else return `<@&${role.id}>`;
                        })
                        .join(" "),
                }),
            )
            .setColor(hexAccentColor || "#2F3136");

        message.channel.send({
            embeds: [embed],
        });
    }
}
