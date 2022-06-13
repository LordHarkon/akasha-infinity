import { Events, Listener, PieceContext } from "@sapphire/framework";
import type { Guild } from "discord.js";
import { useGuildWebhook } from "#lib/hooks/useGuildWebhook";
import { bold, pluralize, underline } from "#lib/utils";
import { Embed } from "#structures/Embed";
import Settings from "#database/Settings";
import { stripIndent } from "common-tags";
import { explicitContentFilters, nsfwLevels, premiumTiers, verificationLevels } from "#lib/constants";

export class GuildCreate extends Listener<typeof Events.GuildCreate> {
    public constructor(context: PieceContext) {
        super(context, {
            name: "guildCreate",
            event: Events.GuildCreate,
        });
    }

    public override async run(guild: Guild) {
        const { logger, colors } = this.container;

        // Create appropriate database entry for the guild if it doens't exist
        await new Settings(guild).init();

        const webhook = useGuildWebhook();

        const memberLabel = pluralize(guild.memberCount, "member", "members");

        logger.info(
            `${colors.red(guild.name)} (${colors.green(guild.id)}) has ${colors.green("added")} the application. They have ${colors.cyanBright(
                guild.memberCount.toLocaleString(),
            )} ${memberLabel}.`,
        );

        const embed = new Embed()
            .setTitle(`Guild Added | ${guild.name} | ${guild.id}`)
            .setDescription(
                stripIndent`${bold(underline("Information"))}
                ${bold("Owner »")} ${(await guild.fetchOwner()).user.tag}
                ${bold("Partnered »")} ${guild.partnered ? "Yes" : "No"}
                ${bold("Verification Level »")} ${verificationLevels[guild.verificationLevel]}
                ${bold("Explicit Content Level »")} ${explicitContentFilters[guild.explicitContentFilter]}
                ${bold("Two-Step Authentication »")} ${guild.mfaLevel === "NONE" ? "No" : "Yes"}
                ${bold("NSFW Level »")} ${nsfwLevels[guild.nsfwLevel.toString()]}
                ${bold("Created At »")} <t:${(guild.createdTimestamp / 1000).toFixed(0)}:d> (<t:${(guild.createdTimestamp / 1000).toFixed(0)}:R>)
                
                ${bold(underline("Statistics"))}
                ${bold("Member Count »")} ${guild.memberCount}
                ${bold("Emojis »")} ${guild.emojis.cache.size}
                ${bold("Channels »")} ${guild.channels.cache.size}
                ${bold("Roles »")} ${guild.roles.cache.size}
                ${bold("Boosts Tier »")} ${premiumTiers[guild.premiumTier]}
                ${bold("Boosts »")} ${guild.premiumSubscriptionCount}
                `,
            )
            .setColor("DARK_GREEN");

        if (guild.icon) embed.setThumbnail(guild.iconURL({ dynamic: true, size: 4096 }));

        await webhook.send({ embeds: [embed] });
    }
}
