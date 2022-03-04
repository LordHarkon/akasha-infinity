import AkashaSubCommand from "#structures/AkashaSubCommand";
import AkashaEmbed from "#structures/AkashaEmbed";
import { ApplyOptions } from "@sapphire/decorators";
import type { AkashaCommandOptions } from "#typings/index";
import type { AllowedImageSize, Message } from "discord.js";
import type { Args } from "@sapphire/framework";
import { reply } from "@sapphire/plugin-editable-commands";

@ApplyOptions<AkashaCommandOptions>({
    name: "avatar",
    aliases: ["av", "pfp"],
    description: "Shows the avatar of the requested memeber.",
    detailedDescription: "If no member is specified, the avatar of the author will be shown.",
    examples: ["avatar", "avatar @Hooshu#0001", "avatar Hooshu", "avatar Hooshu --size=2048"],
    usage: "[member] [--size=<number(256-4096)>]",
    options: ["size"],
    requiredClientPermissions: ["EMBED_LINKS"],
    preconditions: ["GuildOnly"],
})
export default class AvatarCommand extends AkashaSubCommand {
    public async messageRun(message: Message, args: Args) {
        const member = await args
            .pick("member")
            .catch(() => message.guild?.members.cache.filter((m) => m.id === message.author.id).first());
        const size = parseInt(await args.getOption("size")) || 4096;
        const avatar = member?.displayAvatarURL({ dynamic: true, size: size as AllowedImageSize });

        return await reply(message, {
            embeds: [
                new AkashaEmbed()
                    .setTitle(`${member?.user?.username}#${member?.user?.discriminator}'s avatar`)
                    .setImage(avatar)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) }),
            ],
        });
    }
}
