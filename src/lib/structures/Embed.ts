import { MessageEmbed, MessageEmbedOptions } from "discord.js";

export class Embed extends MessageEmbed {
    public constructor(data?: MessageEmbed | MessageEmbedOptions) {
        super(data);

        this.color = (data?.color as number) ?? 14739455;
        this.timestamp = (data?.timestamp ?? Date.now()) as number | null;
    }
}
