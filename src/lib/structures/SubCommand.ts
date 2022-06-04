import type { SubCommandOptions } from "#typings/index";
import type { PieceContext } from "@sapphire/pieces";
import { SubCommandPluginCommand } from "@sapphire/plugin-subcommands";

export abstract class SubCommand extends SubCommandPluginCommand {
    public usage?: string;
    public examples?: string[];

    public constructor(context: PieceContext, options: SubCommandOptions) {
        super(context, options);

        this.examples = options.examples || [];
        this.usage = options.usage || "";
    }
}
