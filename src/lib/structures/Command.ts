import { ArgType, Command as BaseCommand } from "@sapphire/framework";
import type { PieceContext } from "@sapphire/pieces";
import type { CommandOptions, CommandJSON } from "#typings/index";

export abstract class Command extends BaseCommand {
    /**
     * The usage of the piece.
     * @default []
     */
    public usage?: string;

    /**
     * Usage examples of the piece.
     * @default []
     */
    public examples?: string[];

    public constructor(context: PieceContext, options: CommandOptions) {
        super(context, options);

        this.examples = options.examples || [];
        this.usage = options.usage || "";
    }

    public toJSON(): CommandJSON {
        return {
            ...super.toJSON(),
            examples: this.examples,
            usage: this.usage,
        };
    }

    /**
     *
     * @param getArg The result of the argument method.
     * @param message The error message to send if the argument is invalid. Ignore when defaultValue is a truthy value.
     * @param defaultValue The default value to use if the argument is invalid.
     * @param validators An array of validators to use.
     * @param option Whether the argument is a flag or option
     * @example
     * await handleArgs(
     *      args.pick("string"),
     *      "Please provide a valid string argument.",
     *      "default",
     *      [
     *          [(value: string) => value.length > 50, "The argument can only be 50 characters long."]
     *      ]
     * );
     */
    protected async handleArgs<T extends ArgType[keyof ArgType] | Array<ArgType[keyof ArgType]>>(
        getArg: Promise<T> | T,
        message?: string,
        defaultValue?: T,
        validators?: Array<[Function, string]>,
        option?: boolean,
    ): Promise<T> {
        let result;

        if (option) {
            result = getArg;
            if (defaultValue && !result) result = defaultValue;
        } else {
            // @ts-ignore
            result = await getArg?.catch(() => {
                if (defaultValue) return defaultValue;
                throw message;
            });
        }

        if (!result && !option) {
            throw message;
        }

        if (validators?.length > 0 && result) {
            validators.forEach((validator: [Function, string]) => {
                if (!validator[0](result.toString())) {
                    throw validator[1];
                }
            });
        }

        return result;
    }
}
