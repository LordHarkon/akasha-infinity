import { Command } from "#lib/structures/Command";
import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import type { CommandOptions } from "#typings/index";
import type { GuildMember, Message } from "discord.js";
import { Args } from "@sapphire/framework";
import { sendLocalized } from "@sapphire/plugin-i18next";
import ms from "ms";

@ApplyOptions<CommandOptions>({
    name: "timeout",
    examples: ["timeout TestUser", "timeout TestUser 1h", "timeout TestUser 1h 10m", "timeout TestUser 1h 10m 10s"],
    usage: "<user> [duration<0, 27d 23h 59m>]",
    preconditions: [
        "GuildOnly",
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
    @RequiresGuildContext(async (message: Message) => await sendLocalized(message, "errors:guildOnly"))
    public async messageRun(message: Message, args: Args): Promise<Message | void> {
        let stringTime: string = "";
        const target: GuildMember | null = await args.pick("member").catch(() => null);
        const time: number | null = await args
            .rest("string")
            .then((s) => {
                const splitTime: string[] = s.split(" ");
                let fullTime: number = 0;
                splitTime.forEach((item) => (fullTime += ms(item)));
                stringTime = s
                    .split(" ")
                    .map((item) => ms(ms(item), { long: true }))
                    .join(" ");
                return fullTime;
            })
            .catch(() => null);

        if (!target) {
            return await sendLocalized(message, "commands/timeout:noTarget");
        }

        if ((time && time < 0) || (time && time > ms("28d") - ms("1m"))) {
            return await sendLocalized(message, "commands/timeout:invalidTime");
        }

        try {
            let success: Message<boolean> | null = null;

            target.timeout(time);

            if (time) {
                success = await sendLocalized(message, {
                    keys: "commands/timeout:successTimeout",
                    formatOptions: {
                        time: stringTime,
                    },
                });
            } else {
                success = await sendLocalized(message, "commands/timeout:successRemove");
            }

            setTimeout(async () => {
                await success.delete();
                await message.delete();
            }, 5000);

            return success;
        } catch (error) {
            // let errorMessage: string | null = null;
            // if (error.code === 50034) errorMessage = await resolveKey(message, "commands/purge:14dayLimit");
            // else errorMessage = await resolveKey(message, "errors:unknown");
            const msg = await sendLocalized(message, {
                keys: "errors:unknown",
            });

            setTimeout(async () => {
                await msg.delete();
            }, 5000);

            return msg;
        }
    }
}
