import { Command } from "@sapphire/framework";
import type { PieceContext } from "@sapphire/pieces";
import type { AkashaCommandOptions, AkashaCommandJSON } from "#typings/index";

export default abstract class AkashaCommand extends Command {
    public usage?: string;
    public examples?: string[];

    public constructor(context: PieceContext, options: AkashaCommandOptions) {
        super(context, options);

        this.examples = options.examples || [];
        this.usage = options.usage || "";
    }

    public toJSON(): AkashaCommandJSON {
        return {
            ...super.toJSON(),
            examples: this.examples,
            usage: this.usage,
        };
    }
}
