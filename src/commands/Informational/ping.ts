import { Command } from "#lib/structures/Command";
import { ApplyOptions } from "@sapphire/decorators";
import type { CommandOptions } from "#typings/index";
import type { Message } from "discord.js";
import { editLocalized, sendLocalized } from "@sapphire/plugin-i18next";

@ApplyOptions<CommandOptions>({
    name: "ping",
    examples: ["ping"],
    preconditions: [
        {
            name: "CustomCooldown",
            context: {
                delay: 1000,
            },
        },
    ],
    requiredClientPermissions: ["SEND_MESSAGES"],
})
export class PingCommand extends Command {
    public override async messageRun(message: Message) {
        const msg = await sendLocalized(message, "commands/ping:success_initial");

        await editLocalized(msg, {
            keys: "commands/ping:success_final",
            formatOptions: {
                bot_latency: Math.round(this.container.client.ws.ping),
                api_latency: (msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp),
            },
        });
    }
}
