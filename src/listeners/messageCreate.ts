import { Listener, Events, Resolvers } from "@sapphire/framework";
import type { PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";
import Settings from "#lib/database/Settings";
import Experience from "#lib/database/Experience";
import { randomRange } from "#lib/utils";
import User from "#lib/database/User";
import type { IReward } from "#models/Settings";
import Currency from "#lib/database/Currency";
import Inventory from "#lib/database/Inventory";
import { Types } from "mongoose";

const cooldown = new Set<string>();

export class MessageEvent extends Listener<typeof Events.MessageCreate> {
    public constructor(context: PieceContext) {
        super(context, {
            event: Events.MessageCreate,
        });
    }

    public async run(message: Message) {
        // TODO: Maybe make it so that when the user talks there's a 1% chance of getting a random amount of money, or some item
        // If the message was sent by a webhook, return
        if (message.webhookId !== null) return;

        // If the message was sent by a bot, return
        if (message.author.bot) return;

        // If the message was sent by the system, return
        if (message.system) return;

        // If the message was not sent in a guild, return
        if (!message.guild) return;

        const guildSettings = new Settings(message.guild);
        await guildSettings.init();
        const userExperience = new Experience(message.author, message.guild);
        await userExperience.initialize();
        const userData = new User(message.author, message.guild);
        await userData.init();
        const currency = new Currency(message.author, message.guild);
        await currency.initialize();
        const inventory = new Inventory(message.author, message.guild);
        await inventory.initialize();

        let experienceLogs;

        if (guildSettings.experienceLogsChannel && guildSettings.logOptions.logExperienceGains)
            experienceLogs = Resolvers.resolveGuildTextChannel(guildSettings.experienceLogsChannel, message.guild)?.value;

        if (!message.content.startsWith(guildSettings.prefix)) {
            if (cooldown.has(message.author.id)) return;
            else cooldown.add(message.author.id);

            setTimeout(() => {
                cooldown.delete(message.author.id);
            }, 5000);

            // TODO: Implement active effects for the gaining of experience
            const newExperience = randomRange(1, 10);

            await userExperience.add(newExperience);

            if (experienceLogs) experienceLogs.send(`${message.author.tag} gained ${newExperience} experience.`);
        }

        await userData.raiseMessageCount();

        const eligibleRewards = guildSettings.rewards.filter((reward) => reward.levelRequired <= userExperience.level && !reward.disabled);
        const redeemedRewards = userData.guildUser.collectedRewards;
        if (eligibleRewards) {
            const remainingRewards = eligibleRewards.filter((reward) => !redeemedRewards.includes(reward.id));
            if (remainingRewards.length > 0) {
                remainingRewards.forEach(async (reward: IReward) => {
                    if (reward.rewardType === "money") {
                        await currency.add(parseInt(reward.reward));
                        await userData.addCollectedReward(reward.id);
                        if (experienceLogs)
                            experienceLogs.send(
                                `${message.author.tag} received ${reward.reward} ${reward.rewardType} for reaching level ${reward.levelRequired}.`,
                            );
                    } else if (reward.rewardType === "item") {
                        await inventory.add(new Types.ObjectId(reward.reward), 1);
                        await userData.addCollectedReward(reward.id);
                        if (experienceLogs)
                            experienceLogs.send(
                                `${message.author.tag} received item with the ID ${reward.reward} for reaching level ${reward.levelRequired}.`,
                            );
                    } else if (reward.rewardType === "role") {
                        message.guild.members.cache.get(message.author.id)?.roles.add(reward.reward);
                        await userData.addCollectedReward(reward.id);
                        if (experienceLogs)
                            experienceLogs.send(
                                `${message.author.tag} received the role <@&${reward.reward}> for reaching level ${reward.levelRequired}.`,
                            );
                    }
                });
            }
        }
    }
}
