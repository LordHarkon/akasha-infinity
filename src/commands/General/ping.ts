import AkashaCommand from "#structures/AkashaCommand";
import { ApplyOptions } from "@sapphire/decorators";
import { send } from "@sapphire/plugin-editable-commands";
import type { AkashaCommandOptions } from "#typings/index";
import type { Message } from "discord.js";

@ApplyOptions<AkashaCommandOptions>({
    description: "Pong!",
    examples: ["ping"],
})
export class PingCommand extends AkashaCommand {
    public async messageRun(message: Message) {
        const msg = await send(message, "Ping?");

        const content = `Pong!🏓\nBot Latency ${Math.round(this.container.client.ws.ping)}ms.\nAPI Latency ${
            (msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)
        }ms.`;

        return send(message, content);
    }
}
