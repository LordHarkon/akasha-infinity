import { Command } from "#lib/structures/Command";
import { Embed } from "#lib/structures/Embed";
import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import type { CommandOptions } from "#typings/index";
import type { AllowedImageSize, DynamicImageFormat, GuildMember, Message } from "discord.js";
import type { Args } from "@sapphire/framework";
import { reply } from "@sapphire/plugin-editable-commands";
import { replyLocalized, resolveKey } from "@sapphire/plugin-i18next";
import { imageFormats, isValidImageFormat, isValidImageSize, imageSizes } from "#lib/utils";

@ApplyOptions<CommandOptions>({
    name: "avatar",
    aliases: ["av", "pfp"],
    examples: ["avatar", "avatar @user#0001", "avatar user", "avatar user --size=4096 --format=png"],
    usage: "[member] [--size=<number>] [--format=<format>]",
    options: ["size", "format"],
    preconditions: ["NotBlacklisted"],
    // cooldown: {
    //     delay: 1000,
    // },
    requiredClientPermissions: ["EMBED_LINKS"],
})
export default class AvatarCommand extends Command {
    @RequiresGuildContext(async (message: Message) => await replyLocalized(message, "errors:guildOnly"))
    public async messageRun(message: Message, args: Args) {
        const member: GuildMember = await args.pick("member").catch(() => message.member);

        const size = parseInt(
            await this.handleArgs(
                args.getOption("size"),
                null,
                "4096",
                [
                    [
                        (value: string) => isValidImageSize(parseInt(value)),
                        await resolveKey(message, "commands/avatar:invalidSize", {
                            sizes: imageSizes.map((i) => `\`${i}\``).join(", "),
                        }),
                    ],
                ],
                true,
            ),
        );

        const format = await this.handleArgs(
            args.getOption("format"),
            null,
            "png",
            [
                [
                    isValidImageFormat,
                    await resolveKey(message, "commands/avatar:invalidFormat", {
                        formats: imageFormats.map((i) => `\`${i}\``).join(", "),
                    }),
                ],
            ],
            true,
        );

        const avatar = member?.displayAvatarURL({ dynamic: true, size: size as AllowedImageSize, format: format as DynamicImageFormat });

        return await reply(message, {
            embeds: [
                new Embed()
                    .setTitle(
                        await resolveKey(message, "commands/avatar:user", {
                            user: `${member?.user?.username}#${member?.user?.discriminator}`,
                        }),
                    )
                    .setImage(avatar)
                    .setFooter({
                        text: await resolveKey(message, "commands/avatar:requestedBy", {
                            user: message.author.tag,
                        }),
                        iconURL: message.author.displayAvatarURL({ dynamic: true }),
                    }),
            ],
        });
    }
}
