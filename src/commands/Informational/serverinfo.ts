import { Command } from "#lib/structures/Command";
import { Embed } from "#lib/structures/Embed";
import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import { explicitContentFilters, nsfwLevels, premiumTiers, verificationLevels } from "#lib/constants";
import type { CommandOptions } from "#typings/index";
import type { AllowedImageSize, GuildMember, Message, MessageEmbed, Role } from "discord.js";
import { resolveKey, sendLocalized } from "@sapphire/plugin-i18next";
import { format, formatDistance } from "date-fns";

@ApplyOptions<CommandOptions>({
    aliases: ["guildinfo"],
    examples: ["serverinfo"],
    cooldown: {
        delay: 1000,
    },
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

        const embed: MessageEmbed = new Embed()
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 4096 as AllowedImageSize }))
            .addField(
                await resolveKey(message, "commands/serverinfo:owner"),
                await guild.fetchOwner().then((member: GuildMember) => member.toString()),
                true,
            )
            .addField(await resolveKey(message, "commands/serverinfo:memberCount"), guild.memberCount.toString(), true)
            .addField(await resolveKey(message, "commands/serverinfo:emojis"), guild.emojis.cache.size.toString(), true)
            .addField(await resolveKey(message, "commands/serverinfo:channels"), guild.channels.cache.size.toString(), true)
            .addField(await resolveKey(message, "commands/serverinfo:roles"), guild.roles.cache.size.toString(), true)
            .addField(await resolveKey(message, "commands/serverinfo:partnered"), guild.partnered ? "Yes" : "No", true)
            .addField(await resolveKey(message, "commands/serverinfo:verificationLevel"), verificationLevels[guild.verificationLevel], true)
            .addField(
                await resolveKey(message, "commands/serverinfo:explicitContentFilter"),
                explicitContentFilters[guild.explicitContentFilter],
                true,
            )
            .addField(await resolveKey(message, "commands/serverinfo:boostsTier"), premiumTiers[guild.premiumTier], true)
            .addField(await resolveKey(message, "commands/serverinfo:boosts"), guild.premiumSubscriptionCount.toString(), true)
            .addField(await resolveKey(message, "commands/serverinfo:nsfwLevel"), nsfwLevels[guild.nsfwLevel.toString()], true)
            .addField(await resolveKey(message, "commands/serverinfo:2faRequired"), guild.mfaLevel === "NONE" ? "No" : "Yes", true)
            .addField(
                await resolveKey(message, "commands/serverinfo:createdAt"),
                format(guild.createdAt, "dd MMMM yyyy HH:mm") + "\n(" + formatDistance(guild.createdAt, new Date(), { addSuffix: true }) + ")",
                // formatDistance(guild.createdAt, new Date(), { addSuffix: true }),
                true,
            )
            .setFooter({ text: guild.id });

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
