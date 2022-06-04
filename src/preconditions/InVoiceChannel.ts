import { Precondition, PreconditionResult } from "@sapphire/framework";
import type { GuildMember, Message } from "discord.js";

export class InVoiceChannel extends Precondition {
    public run(message: Message): PreconditionResult {
        const member = message.member as GuildMember;
        return member.voice.channel === null ? this.error({ message: "You must be in a voice channel to be able to use this command." }) : this.ok();
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        InVoiceChannel: never;
    }
}
