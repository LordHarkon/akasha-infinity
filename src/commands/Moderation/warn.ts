import { Command } from "#lib/structures/Command";
import { ApplyOptions } from "@sapphire/decorators";
import type { CommandOptions } from "#typings/index";
import type { Message } from "discord.js";

@ApplyOptions<CommandOptions>({
    name: "warn",
    examples: ["warn"],
    preconditions: [
        "GuildOnly",
        {
            name: "CustomCooldown",
            context: {
                delay: 1000,
            },
        },
    ],
    requiredClientPermissions: [],
    requiredUserPermissions: ["MODERATE_MEMBERS"],
})
export class WarnCommand extends Command {
    public override async messageRun(message: Message) {
        message.channel.send("Hello World!");
    }
}
