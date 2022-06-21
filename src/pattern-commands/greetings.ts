import { PatternCommand } from "@sapphire/plugin-pattern-commands";
import type { Message } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<PatternCommand.Options>({
    aliases: ["hello", "hi", "goodbye", "bye"],
    chance: 80,
    matchFullName: true,
})
export class GreetingsCommand extends PatternCommand {
    public async messageRun(message: Message): Promise<Message> {
        return await message.reply("Hello!");
    }
}
