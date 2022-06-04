import { Command } from "#lib/structures/Command";
import { ApplyOptions } from "@sapphire/decorators";
import type { CommandOptions } from "#typings/index";
import type { GuildMember, Message, MessageEmbed } from "discord.js";
import Experience from "#database/Experience";
import { Embed } from "#lib/structures/Embed";
import type { Args } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { formatNumber, percentage } from "#lib/utils";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions<CommandOptions>({
    examples: ["level", "level user", "level @user#0001"],
    usage: "[member]",
    cooldown: {
        delay: 3000,
        premiumDelay: 1000,
    },
    requiredClientPermissions: ["EMBED_LINKS"],
})
export class LevelCommand extends Command {
    public async messageRun(message: Message, args: Args) {
        const member: GuildMember = await args.pick("member").catch(() => message.member);

        const experience = new Experience(member.user, message.guild);
        await experience.initialize();

        const embed: MessageEmbed = new Embed()
            .setColor(parseInt(member.id.substr(12, member.id.length)))
            .setAuthor({
                name: member.user.tag,
                iconURL: member.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(
                await resolveKey(message, "commands/level:levelInfo", {
                    level: experience.level,
                    currentExperience: formatNumber(experience.currentExperience),
                    upperBound: formatNumber(experience.uppperBound),
                    percentage: percentage(experience.currentExperience, experience.uppperBound),
                    totalExperience: formatNumber(experience.experience),
                }),
            );

        return send(message, { embeds: [embed] });
    }
}
