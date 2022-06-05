import { Command } from "#lib/structures/Command";
import { ApplyOptions } from "@sapphire/decorators";
import type { CommandOptions } from "#typings/index";
import type { GuildMember, Message, MessageEmbed } from "discord.js";
// import Experience from "#database/Experience";
import { Embed } from "#lib/structures/Embed";
import type { Args } from "@sapphire/framework";
// import { resolveKey } from "@sapphire/plugin-i18next";
import { formatNumber } from "#lib/utils";
import { send } from "@sapphire/plugin-editable-commands";
import User from "#lib/database/User";
import Currency from "#lib/database/Currency";
import { resolveKey } from "@sapphire/plugin-i18next";

@ApplyOptions<CommandOptions>({
    examples: ["level", "level user", "level @user#0001"],
    usage: "[member]",
    preconditions: [
        {
            name: "CustomCooldown",
            context: {
                delay: 3000,
                premiumDelay: 1000,
            },
        },
    ],
    requiredClientPermissions: ["EMBED_LINKS"],
})
export class LevelCommand extends Command {
    public async messageRun(message: Message, args: Args) {
        const member: GuildMember = await args.pick("member").catch(() => message.member);

        const _user = new User(member.user, message.guild);
        await _user.init();
        const _bank = new Currency(member.user, message.guild);
        await _bank.initialize();

        const embed: MessageEmbed = new Embed()
            .setColor(parseInt(member.id.substr(12, member.id.length)))
            .setAuthor({
                name: member.user.tag,
                iconURL: member.displayAvatarURL({ dynamic: true }),
            })
            .addField(await resolveKey(message, "commands/stats:bank"), await resolveKey(message, "commands/stats:bank"))
            .addField(await resolveKey(message, "commands/stats:currentlyOwning"), formatNumber(_bank.currentAmount), true)
            .addField(await resolveKey(message, "commands/stats:totalOwned"), formatNumber(_bank.totalAmount), true)
            .addField(await resolveKey(message, "commands/stats:rps"), await resolveKey(message, "commands/stats:rps"))
            .addField(await resolveKey(message, "commands/stats:played"), formatNumber(_user.guildUser.stats.games.rps.played), true)
            .addField(await resolveKey(message, "commands/stats:won"), formatNumber(_user.guildUser.stats.games.rps.won), true)
            .addField(await resolveKey(message, "commands/stats:lost"), formatNumber(_user.guildUser.stats.games.rps.lost), true)
            .addField(await resolveKey(message, "commands/stats:rpsls"), await resolveKey(message, "commands/stats:rpsls"))
            .addField(await resolveKey(message, "commands/stats:played"), formatNumber(_user.guildUser.stats.games.rpsls.played), true)
            .addField(await resolveKey(message, "commands/stats:won"), formatNumber(_user.guildUser.stats.games.rpsls.won), true)
            .addField(await resolveKey(message, "commands/stats:lost"), formatNumber(_user.guildUser.stats.games.rpsls.lost), true)
            .addField(await resolveKey(message, "commands/stats:slots"), await resolveKey(message, "commands/stats:slots"))
            .addField(await resolveKey(message, "commands/stats:played"), formatNumber(_user.guildUser.stats.games.slots.played), true)
            .addField(await resolveKey(message, "commands/stats:won"), formatNumber(_user.guildUser.stats.games.slots.won), true)
            .addField(await resolveKey(message, "commands/stats:lost"), formatNumber(_user.guildUser.stats.games.slots.lost), true)
            .addField(await resolveKey(message, "commands/stats:moneyWon"), formatNumber(_user.guildUser.stats.games.slots.moneyWon), true)
            .addField(await resolveKey(message, "commands/stats:moneyLost"), formatNumber(_user.guildUser.stats.games.slots.moneyLost), true)
            .addField(await resolveKey(message, "commands/stats:roulette"), await resolveKey(message, "commands/stats:roulette"))
            .addField(await resolveKey(message, "commands/stats:played"), formatNumber(_user.guildUser.stats.games.roulette.played), true)
            .addField(await resolveKey(message, "commands/stats:won"), formatNumber(_user.guildUser.stats.games.roulette.won), true)
            .addField(await resolveKey(message, "commands/stats:lost"), formatNumber(_user.guildUser.stats.games.roulette.lost), true)
            .addField(await resolveKey(message, "commands/stats:moneyWon"), formatNumber(_user.guildUser.stats.games.roulette.moneyWon), true)
            .addField(await resolveKey(message, "commands/stats:moneyLost"), formatNumber(_user.guildUser.stats.games.roulette.moneyLost), true);

        return send(message, { embeds: [embed] });
    }
}
