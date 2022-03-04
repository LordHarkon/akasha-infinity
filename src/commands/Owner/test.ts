import AkashaCommand from "#structures/AkashaCommand";
import { ApplyOptions } from "@sapphire/decorators";
import type { AkashaCommandOptions } from "#typings/index";
import type { Message } from "discord.js";

@ApplyOptions<AkashaCommandOptions>({
    aliases: [],
    description: "Basic description.",
    detailedDescription: "A more lengty continuation of the description.",
    examples: ["test"],
    usage: "",
    preconditions: ["OwnerOnly", "InVoiceChannel"],
    flags: [],
    options: [],
    requiredClientPermissions: [],
    requiredUserPermissions: [],
})
export class TestCommand extends AkashaCommand {
    public async messageRun(message: Message): Promise<Message> {
        // console.log(message.author);
        return await message.channel.send("World!");
    }
}
