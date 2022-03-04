import { Listener, Events } from "@sapphire/framework";
import type { PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export class MessageEvent extends Listener<typeof Events.MessageCreate> {
    public constructor(context: PieceContext) {
        super(context, {
            event: Events.MessageCreate,
        });
    }
    public run(message: Message) {
        // If the message was sent by a webhook, return
        if (message.webhookId !== null) return;

        // If the message was sent by a bot, return
        if (message.author.bot) return;

        // If the message was sent by the system, return
        if (message.system) return;

        // If the message was not sent in a guild, return
        if (!message.guild) return;
    }
}
