import AkashaCommand from "#structures/AkashaCommand";
import AkashaEmbed from "#structures/AkashaEmbed";
import { ApplyOptions, RequiresClientPermissions, RequiresGuildContext } from "@sapphire/decorators";
import { explicitContentFilterLevels, nsfwLevels, premiumTiers, verificationLevels } from "#lib/constants";
import type { AkashaCommandOptions } from "#typings/index";
import type { GuildMember, Message, MessageEmbed, Role } from "discord.js";

@ApplyOptions<AkashaCommandOptions>({
    aliases: ["guildinfo"],
    description: "Shows the server's information.",
    detailedDescription:
        "Show information about the server the command was used in. Example of information would be the number of members, channels, roles, etc.",
    examples: ["serverinfo"],
    usage: "",
})
export class ServerInfoCommand extends AkashaCommand {
    @RequiresClientPermissions("EMBED_LINKS")
    @RequiresGuildContext((message: Message) => message.channel.send("This command can only be used in a server."))
    public async messageRun(message: Message) {
        const guild = message.guild;

        const roles = [];
        let index = 0;

        guild.roles.cache.forEach((role: Role) => {
            if (roles[index]?.length > 0 && roles[index]?.join(" ")?.length > 1000) {
                roles[index + 1] = [];
                roles[index + 1].push(`<@&${role.id}>`);
                index++;
            } else {
                if (roles[index]?.length > 0) roles[index].push(`<@&${role.id}>`);
                else roles[index] = [`<@&${role.id}>`];
            }
        });

        const embed: MessageEmbed = new AkashaEmbed()
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addField("Owner", await guild.fetchOwner().then((member: GuildMember) => member.toString()), true)
            .addField("Member Count", guild.memberCount.toString(), true)
            .addField("Emojis", guild.emojis.cache.size.toString(), true)
            .addField("Channels", guild.channels.cache.size.toString(), true)
            .addField("Roles", guild.roles.cache.size.toString(), true)
            .addField("Partnered", guild.partnered ? "Yes" : "No", true)
            .addField("Verification Level", verificationLevels[guild.verificationLevel.toString()], true)
            .addField("Explicit Content Filter", explicitContentFilterLevels[guild.explicitContentFilter.toString()], true)
            .addField("Boosts Tier", premiumTiers[guild.premiumTier.toString()].toString(), true)
            .addField("Boosts", guild.premiumSubscriptionCount.toString(), true)
            .addField("NSFW Level", nsfwLevels[guild.nsfwLevel.toString()], true)
            .addField("2FA Required", guild.mfaLevel.toString() === "NONE" ? "No" : "Yes", true)
            .addField("Created at", guild.createdAt.toLocaleString(), true)
            .setFooter({ text: guild.id });

        roles.forEach(
            (role: Role[], index: number) =>
                role.length > 0 && embed.addField(`Roles${roles.length !== 1 ? ` (${index + 1})` : ""}`, role.join(" ")),
        );

        return message.channel.send({
            embeds: [embed],
        });
    }
}
