import { MessageEmbed, MessageEmbedFooter, MessageEmbedOptions } from "discord.js";
import { container } from "@sapphire/framework";

export class Embed extends MessageEmbed {
    public constructor(data?: MessageEmbed | MessageEmbedOptions) {
        super(data);

        this.color = (data?.color as number) ?? 14739455;
        this.timestamp = (data?.timestamp ?? Date.now()) as number | null;
        this.footer = (data?.footer ?? {
            iconURL: container.client.user.avatarURL(),
            text: `Infinity v${process.env.VER}`,
        }) as MessageEmbedFooter;
    }
}
