import { type CommandDeniedPayload, Events, type ListenerOptions, type UserError } from "@sapphire/framework";
import type { PieceContext } from "@sapphire/pieces";
import { Listener } from "@sapphire/framework";

export class UserEvent extends Listener<typeof Events.CommandDenied> {
    public constructor(context: PieceContext, options?: ListenerOptions) {
        super(context, {
            ...options,
            event: Events.CommandDenied,
        });
    }
    public async run({ context, message: content }: UserError, { message }: CommandDeniedPayload) {
        if (Reflect.get(Object(context), "silent")) return false;

        return message.channel.send(`<@${message.author.id}>, ${content}`);
    }
}
