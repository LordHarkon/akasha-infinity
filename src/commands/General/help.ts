import { envParseArray } from "#lib/env-parser";
import AkashaCommand from "#structures/AkashaCommand";
import AkashaEmbed from "#structures/AkashaEmbed";
import { ApplyOptions } from "@sapphire/decorators";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import type { Args } from "@sapphire/framework";
import { reply, send } from "@sapphire/plugin-editable-commands";
import type { AkashaCommandOptions } from "#typings/index";
import type { Message } from "discord.js";
import { sendLoadingMessage } from "#lib/utils";

@ApplyOptions<AkashaCommandOptions>({
    aliases: ["commands", "cmds", "cmd"],
    description: "Shows the help menu.",
    detailedDescription:
        "If no command is specified, the help menu for all commands will be shown.\nIf a command is specified, the help menu for that command will be shown.",
    examples: ["help", "help ping"],
    usage: "[command]",
    preconditions: ["GuildOnly"],
})
export class HelpCommand extends AkashaCommand {
    public async messageRun(message: Message, args: Args) {
        // TODO: Change this to check database for each server
        const prefix = this.container.client.options.defaultPrefix;
        if (args.finished) {
            return this.sortCommands(message);
        } else {
            const arg: string | null = await args.pick("string");
            const command: AkashaCommand | null = this.container.stores.get("commands").get(arg);
            if (!command) return reply(message, "This command does not exist.");

            const embed = new AkashaEmbed()
                .setTitle(`Help Menu | ${command.name}`)
                .setDescription(`${command.description}\n${command.detailedDescription}`)
                .addField("Category", command.category)
                .addField("Aliases", command.aliases.length ? command.aliases.join(", ") : "None");

            if (command.options.flags) embed.addField("Flags", `\`${(command.options.flags as string[]).join("`, `")}\``);
            if (command.options.options) embed.addField("Options", `\`${(command.options.options as string[]).join("`, `")}\``);

            embed
                .addField("Usage", `• \`${prefix}${command.name} ${command.usage}\``)
                .addField(
                    "Examples",
                    command.examples.length ? command.examples.map((example) => `• \`${prefix}${example}\``).join("\n") : "None",
                );

            return send(message, {
                embeds: [embed],
            });
        }
    }

    protected async sortCommands(message: Message) {
        const response = await sendLoadingMessage(message);

        const allCommands = this.container.stores.get("commands").reduce((acc, curr: AkashaCommand) => {
            const OWNERS = envParseArray("OWNERS");
            if (["Owner", "Patterns"].includes(curr.category) && !OWNERS.includes(message.author.id)) return acc;
            if (Reflect.has(acc, curr.category)) acc[curr.category].push(curr);
            else acc[curr.category] = [curr];
            return acc;
        }, {} as Record<string, AkashaCommand[]>);

        const paginatedMessage = new PaginatedMessage({
            template: new AkashaEmbed().setFooter({
                text: "Use `help [command]` to get more information about a command.",
            }),
        });

        for (const [category, commands] of Object.entries(allCommands)) {
            paginatedMessage.addPageEmbed((embed) =>
                embed
                    .setTitle(`Help Menu | ${category}`)
                    .setDescription(`${commands.map((command) => `• \`${command.name}\` - ${command.description}`).join("\n")}`),
            );
        }

        await paginatedMessage.run(response, message.author);
        return response;
    }
}
