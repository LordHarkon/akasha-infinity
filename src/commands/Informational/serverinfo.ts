import { Command } from "#lib/structures/Command";
import { Embed } from "#lib/structures/Embed";
import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import { explicitContentFilters, nsfwLevels, premiumTiers, verificationLevels } from "#lib/constants";
import type { CommandOptions } from "#typings/index";
import type { AllowedImageSize, Message, MessageEmbed, Role } from "discord.js";
import { resolveKey, sendLocalized } from "@sapphire/plugin-i18next";
import { format, formatDistance } from "date-fns";
import { stripIndent } from "common-tags";
import { bold, underline } from "#lib/utils";

@ApplyOptions<CommandOptions>({
    aliases: ["guildinfo"],
    examples: ["serverinfo"],
    preconditions: [
        {
            name: "CustomCooldown",
            context: {
                delay: 1000,
            },
        },
    ],
    requiredClientPermissions: ["EMBED_LINKS"],
})
export class ServerInfoCommand extends Command {
    @RequiresGuildContext(async (message: Message) => await sendLocalized(message, "errors:guildOnly"))
    public async messageRun(message: Message) {
        const msg = await sendLocalized(message, "commands/serverinfo:loading");

        const guild = message.guild;

        const roles = [];
        let index = 0;

        await Promise.all(
            guild.roles.cache.map((role: Role) => {
                if (role.name === "@everyone") return null;
                if (roles[index]?.length > 0 && roles[index]?.join(" ")?.length > 1000) {
                    roles[index + 1] = [];
                    roles[index + 1].push(`<@&${role.id}>`);
                    index++;
                } else {
                    if (roles[index]?.length > 0) roles[index].push(`<@&${role.id}>`);
                    else roles[index] = [`<@&${role.id}>`];
                }
            }),
        );

        async function tc(key: string, endAddition?: string): Promise<string> {
            return (await resolveKey(message, `commands/serverinfo:${key}`)) + endAddition;
        }

        const embed: MessageEmbed = new Embed()
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 4096 as AllowedImageSize }))
            .setDescription(
                stripIndent`${bold(underline("Information"))}
                ${bold(await tc("id", " »"))} ${guild.id}
                ${bold(await tc("owner", " »"))} ${await guild.fetchOwner().then((m) => m.toString())}
                ${bold(await tc("partnered", " »"))} ${guild.partnered ? "Yes" : "No"}
                ${bold(await tc("verificationLevel", " »"))} ${verificationLevels[guild.verificationLevel]}
                ${bold(await tc("explicitContentFilter", " »"))} ${explicitContentFilters[guild.explicitContentFilter]}
                ${bold(await tc("2faRequired", " »"))} ${guild.mfaLevel === "NONE" ? "No" : "Yes"}
                ${bold(await tc("nsfwLevel", " »"))} ${nsfwLevels[guild.nsfwLevel.toString()]}
                ${bold(await tc("createdAt", " »"))} ${
                    format(guild.createdAt, "dd MMMM yyyy HH:mm") + " (" + formatDistance(guild.createdAt, new Date(), { addSuffix: true }) + ")"
                }
                
                ${bold(underline("Statistics"))}
                ${bold(await tc("memberCount", " »"))} ${guild.memberCount}
                ${bold(await tc("emojis", " »"))} ${guild.emojis.cache.size}
                ${bold(await tc("channels", " »"))} ${guild.channels.cache.size}
                ${bold(await tc("roles", " »"))} ${guild.roles.cache.size}
                ${bold(await tc("boostsTier", " »"))} ${premiumTiers[guild.premiumTier]}
                ${bold(await tc("boosts", " »"))} ${guild.premiumSubscriptionCount}
                `,
            );

        await Promise.all(
            roles.map(
                async (role: Role[], index: number) =>
                    role.length > 0 &&
                    embed.addField(
                        await resolveKey(message, "commands/serverinfo:roles_section", {
                            possible_section: roles.length !== 1 ? ` (${index + 1})` : "",
                        }),
                        role.join(" "),
                    ),
            ),
        );

        return msg.edit({ embeds: [embed], content: await resolveKey(message, "commands/serverinfo:success") });
    }
}
