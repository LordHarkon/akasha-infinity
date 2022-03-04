import type { AkashaSubCommandOptions } from "#typings/index";
import type { PieceContext } from "@sapphire/pieces";
import { SubCommandPluginCommand } from "@sapphire/plugin-subcommands";

export default abstract class AkashaSubCommand extends SubCommandPluginCommand {
    public usage?: string;
    public examples?: string[];

    public constructor(context: PieceContext, options: AkashaSubCommandOptions) {
        super(context, options);

        this.examples = options.examples || [];
        this.usage = options.usage || "";
    }
}
