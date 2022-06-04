import { ArgType, Command as BaseCommand } from "@sapphire/framework";
import type { PieceContext } from "@sapphire/pieces";
import type { CommandOptions, CommandJSON, CooldownOptions } from "#typings/index";

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

    /**
     * The cooldown options for the piece.
     * @default {}
     */
    public cooldown?: CooldownOptions;

    public constructor(context: PieceContext, options: CommandOptions) {
        super(context, options);

        this.examples = options.examples || [];
        this.usage = options.usage || "";
        this.cooldown = options.cooldown || {};
    }

    public toJSON(): CommandJSON {
        return {
            ...super.toJSON(),
            examples: this.examples,
            usage: this.usage,
            cooldown: this.cooldown,
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

    // protected parseConstructorPreConditions(options: CommandOptions): void {
    //     super.parseConstructorPreConditions(options);
    //     this.parseConstructorPreConditionsCustomCooldown(options);
    // }

    // protected parseConstructorPreConditionsCustomCooldown(options: CommandOptions) {
    //     const limit = options.cooldown?.limit ?? 1;
    //     const delay = options.cooldown?.delay ?? 0;
    //     const premiumDelay = options.cooldown?.premiumDelay ?? 0;

    //     if ((limit && delay) || (limit && premiumDelay)) {
    //         const scope = options.cooldown?.scope ?? BucketScope.User;
    //         const filteredUsers = options.cooldown?.filteredUsers ?? [];
    //         this.preconditions.append({
    //             // @ts-ignore
    //             name: "CustomCooldown",
    //             context: { scope, limit, delay, premiumDelay, filteredUsers },
    //         });
    //     }
    // }
}
