import Command from "#root/models/Command";
import type AkashaCommand from "#structures/AkashaCommand";
import type { CommandRunPayload } from "@sapphire/framework";
import { Events, Listener } from "@sapphire/framework";
import type { PieceContext } from "@sapphire/pieces";
import type { Message } from "discord.js";

export class CommandRun extends Listener<typeof Events.CommandRun> {
    public constructor(context: PieceContext) {
        super(context, {
            event: Events.CommandRun,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async run(message: Message, command: AkashaCommand, payload: CommandRunPayload) {
        try {
            await Command.findOneAndUpdate({ command: command.name }, { $inc: { uses: 1 } }, { upsert: true });
        } catch (error: unknown) {
            this.container.logger.error("Error updating command usage count!");
            this.container.logger.info("Command: ", command.name);
            this.container.logger.error((error as Error).stack);
        }
    }
}
