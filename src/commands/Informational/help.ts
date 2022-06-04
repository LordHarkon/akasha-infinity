import { envParseArray } from "#lib/env-parser";
import { Command } from "#lib/structures/Command";
import { Embed } from "#lib/structures/Embed";
import { ApplyOptions, RequiresGuildContext } from "@sapphire/decorators";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import type { Args } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { CommandOptions } from "#typings/index";
import { Message } from "discord.js";
import { capitalize, sendLoadingMessage } from "#lib/utils";
import { replyLocalized, resolveKey, sendLocalized } from "@sapphire/plugin-i18next";
import Settings from "#models/Settings";

@ApplyOptions<CommandOptions>({
    aliases: ["commands", "cmds", "cmd"],
    examples: ["help", "help ping"],
    usage: "[command]",
    cooldown: {
        delay: 1000,
    },
    requiredClientPermissions: ["EMBED_LINKS"],
})
export class HelpCommand extends Command {
    @RequiresGuildContext(async (message: Message) => await sendLocalized(message, "errors:guildOnly"))
    public async messageRun(message: Message, args: Args) {
        const prefix = (await Settings.findOne({ guildId: message?.guild?.id }))?.prefix ?? "inf.";
        if (args.finished) {
            return this.sortCommands(message);
        } else {
            const arg: string | null = await args.pick("string");
            const command: Command | null = this.container.stores.get("commands").get(arg) as Command;
            if (!command) return replyLocalized(message, { keys: "commands/help:unknownCommand" });

            const { name, fullCategory, usage, options, examples } = command;

            const description = await resolveKey(message, [`commands/${name}:description`, "errors:noDescription"]);
            const detailedDescription = await resolveKey(message, [`commands/${name}:detailedDescription`, "errors:noDetailedDescription"]);
            const none = await resolveKey(message, "commands/help:none");

            const embed = new Embed()
                .setTitle(await resolveKey(message, "commands/help:helpMenuCommand", { command: name, category: fullCategory[0] }))
                .setDescription(`${description}\n\n${detailedDescription}`)
                .addField(
                    await resolveKey(message, "commands/help:aliases"),
                    command.aliases.length ? `\`${command.aliases.join("`, `")}\`` : none,
                    true,
                )
                .addField(
                    await resolveKey(message, "commands/help:flags"),
                    `${options.flags ? `\`${(options.flags as string[]).join("`, `")}\`` : "None"}`,
                    true,
                )
                .addField(
                    await resolveKey(message, "commands/help:options"),
                    `${options.options ? `\`${(options.options as string[]).join("`, `")}\`` : "None"}`,
                    true,
                )
                .addField(
                    await resolveKey(message, "commands/help:cooldown"),
                    options?.cooldownDelay ? (options.cooldownDelay / 1000).toFixed(0) + "s" : "None",
                    true,
                )
                .addField(await resolveKey(message, "commands/help:nsfw"), `${options.nsfw ? "True" : "False"}`, true)
                .addField(await resolveKey(message, "commands/help:usage"), `• \`${prefix}${name}${usage ? ` ${usage}` : ""}\``, true)
                .addField(
                    await resolveKey(message, "commands/help:examples"),
                    examples.length ? examples.map((ex) => `• \`${prefix}${ex}\``).join("\n") : none,
                    true,
                );

            if (options.requiredUserPermissions)
                embed.addField(
                    await resolveKey(message, "commands/help:requiredUserPermissions"),
                    `\`${(options.requiredUserPermissions as string[]).join("`, `")}\``,
                    true,
                );
            if (options.requiredClientPermissions)
                embed.addField(
                    await resolveKey(message, "commands/help:requiredBotPermissions"),
                    `\`${(options.requiredClientPermissions as string[]).join("`, `")}\``,
                    true,
                );

            return send(message, {
                embeds: [embed],
            });
        }
    }

    protected async sortCommands(message: Message) {
        const response = await sendLoadingMessage(message);

        const allCommands = this.container.stores.get("commands").reduce((acc, curr: Command) => {
            const OWNERS = envParseArray("OWNERS");
            if (["Owner", "Patterns"].includes(curr.category) && !OWNERS.includes(message.author.id)) return acc;
            if (Reflect.has(acc, curr.category)) acc[curr.category].push(curr);
            else acc[curr.category] = [curr];
            return acc;
        }, {} as Record<string, Command[]>);

        const paginatedMessage = new PaginatedMessage({
            actions: [
                {
                    customId: "@sapphire/paginated-messages.goToPage",
                    type: "SELECT_MENU",
                    options: Object.keys(allCommands).map((key, index) => {
                        return {
                            label: `${key} Page (${allCommands[key].length} commands)`,
                            value: index.toString(),
                            description: `Show the commands in the ${key} category.`,
                        };
                    }),
                    placeholder: "Select a category",
                    run: ({ handler, interaction }) => interaction.isSelectMenu() && (handler.index = parseInt(interaction.values[0], 10)),
                },
                {
                    customId: "@sapphire/paginated-messages.previousPage",
                    emoji: "⬅",
                    run: ({ handler }) => {
                        if (handler.index === 0) {
                            handler.index = handler.pages.length - 1;
                        } else {
                            --handler.index;
                        }
                    },
                    type: "BUTTON",
                    style: "SECONDARY",
                },
                {
                    customId: "@sapphire/paginated-messages.nextPage",
                    emoji: "➡",
                    run: ({ handler }) => {
                        if (handler.index === handler.pages.length - 1) {
                            handler.index = 0;
                        } else {
                            ++handler.index;
                        }
                    },
                    type: "BUTTON",
                    style: "SECONDARY",
                },
                {
                    customId: "@sapphire/paginated-messages.stop",
                    style: "DANGER",
                    emoji: "⏹️",
                    type: "BUTTON",
                    run: async ({ collector }) => {
                        collector.stop();
                        await message.delete();
                        await response.delete();
                    },
                },
            ],
            template: new Embed().setFooter({ text: await resolveKey(message, "commands/help:helpMenuFooter") }),
        });

        for (const [category, commands] of Object.entries(allCommands)) {
            if (category === "Owner") {
                const OWNERS = envParseArray("OWNERS");
                if (!OWNERS.includes(message.author.id)) continue;
            }

            const embed = new Embed().setTitle(await resolveKey(message, "commands/help:helpMenuCategory", { category }));

            await Promise.all(
                commands.map(async (command) => {
                    let commandDescription = await resolveKey(message, [`commands/${command.name}:description`, "errors:noDescription"]);
                    embed.addField(capitalize(command.name), commandDescription);
                }),
            );

            paginatedMessage.addPageEmbed(embed);
        }

        await paginatedMessage.run(response, message.author);
        return response;
    }
}
