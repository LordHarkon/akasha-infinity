import { ArgumentError, CommandErrorPayload, Events, Listener, PieceContext, UserError } from "@sapphire/framework";
import { RESTJSONErrorCodes } from "discord-api-types/v9";
import { DiscordAPIError, HTTPError } from "discord.js";
import { redBright, bold } from "colorette";

export class CommandError extends Listener<typeof Events.CommandError> {
    public constructor(context: PieceContext) {
        super(context, {
            name: "commandError",
            event: Events.CommandError,
            once: false,
        });
    }

    async run(error: Error | string, { message, piece }: CommandErrorPayload) {
        if (typeof error === "string") {
            return message.channel.send(`<@${message.author.id}>, ${error}`);
        }

        if (error instanceof ArgumentError) {
            return message.channel.send(`<@${message.author.id}>, ${error.message}`);
        }

        if (error instanceof UserError) {
            if (Reflect.get(Object(error.context), "silent")) {
                return null;
            }

            return message.channel.send(`<@${message.author.id}>, ${error.message}`);
        }

        if (error.name === "AbortError" || error.message === "Internal Server Error") {
            return message.channel.send(`<@${message.author.id}>, we are having trouble communicating with discord. Please try again later!`);
        }

        if (error instanceof DiscordAPIError || error instanceof HTTPError) {
            if ([RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage].includes(error.code)) {
                return null;
            }
        }

        this.container.logger.fatal(`${redBright(bold(`[${piece.name}]`))} ${error.stack || error.message}`);
        return message.channel.send(`<@${message.author.id}>, something went wrong. Please try again later!`);
    }
}
