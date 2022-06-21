import { Command } from "#lib/structures/Command";
import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import type { CommandOptions } from "#typings/index";
import type { GuildMember, Message } from "discord.js";
import { Args } from "@sapphire/framework";
import { replyLocalized, resolveKey } from "@sapphire/plugin-i18next";
import ms from "ms";

@ApplyOptions<CommandOptions>({
    name: "timeout",
    aliases: ["mute"],
    examples: ["timeout TestUser", "timeout TestUser 1h", "timeout TestUser 1h10m", "timeout TestUser 1h10m10s Bad language."],
    usage: "<user> [duration<0, 27d23h59m>]",
    preconditions: [
        "GuildOnly",
        "ModeratorOnly",
        {
            name: "CustomCooldown",
            context: {
                delay: 1000,
            },
        },
    ],
    requiredClientPermissions: ["MODERATE_MEMBERS"],
    requiredUserPermissions: ["MODERATE_MEMBERS"],
})
export class TimeoutCommand extends Command {
    @RequiresGuildContext(async (message: Message) => await replyLocalized(message, "errors:guildOnly"))
    public async messageRun(message: Message, args: Args): Promise<Message | void> {
        let stringTime: string = "";
        const target: GuildMember | null = await args.pick("member").catch(() => null);
        const time: number | null = await args
            .pick("string")
            .then(async (s) => {
                let splitTime: string[] = s.split(/(\d+[dhms])/i).filter((i) => i);
                let tempStringTime: string[] = [];
                let fullTime: number = 0;

                if (!splitTime) return null;

                function endsWithOneOf(str: string, arr: string[]): boolean {
                    return arr.some((i) => str.endsWith(i));
                }

                for (const time of splitTime) {
                    if (
                        (time.endsWith("d") && parseInt(time) > 27) ||
                        (time.endsWith("h") && parseInt(time) > 23) ||
                        (time.endsWith("m") && parseInt(time) > 59) ||
                        (time.endsWith("s") && !time.endsWith("ms") && parseInt(time) > 59) ||
                        (!endsWithOneOf(time, ["d", "h", "m", "s"]) && !time.endsWith("ms"))
                    ) {
                        throw new Error(await resolveKey(message, "errors:invalidTime"));
                    } else {
                        fullTime += ms(time);
                        tempStringTime.push(ms(ms(time), { long: true }));
                    }
                }

                stringTime = tempStringTime.join(" ");
                return fullTime;
            })
            .catch(() => null);

        if (!target) {
            return await replyLocalized(message, "commands/timeout:noTarget");
        }

        if (!target.moderatable) {
            return await replyLocalized(message, "commands/timeout:noPermissions");
        }

        if (target.isCommunicationDisabled() && time) {
            return await replyLocalized(message, {
                keys: "commands/timeout:alreadyMuted",
                formatOptions: {
                    time: `<t:${Math.ceil(target.communicationDisabledUntilTimestamp / 1000)}:R>`,
                },
            });
        }

        if ((time && time < 0) || (time && time > ms("28d") - ms("1m"))) {
            return await replyLocalized(message, "commands/timeout:invalidTime");
        }

        if (!target.isCommunicationDisabled() && !time) {
            return await replyLocalized(message, "commands/timeout:notMuted");
        }

        try {
            let success: Message | null = null;

            // @ts-ignore
            await target.timeout(time);

            if (time) {
                success = await replyLocalized(message, {
                    keys: "commands/timeout:successTimeout",
                    formatOptions: {
                        time: stringTime,
                    },
                });
            } else {
                success = await replyLocalized(message, "commands/timeout:successRemove");
            }

            return success;
        } catch (error) {
            // let errorMessage: string | null = null;
            // if (error.code === 50034) errorMessage = await resolveKey(message, "commands/purge:14dayLimit");
            // else errorMessage = await resolveKey(message, "errors:unknown");
            const msg = await replyLocalized(message, {
                keys: "errors:unknown",
            });

            setTimeout(async () => {
                await msg.delete();
            }, 5000);

            return msg;
        }
    }
}
