import { Command } from "#lib/structures/Command";
import type { CommandOptions } from "#typings/index";
import { ApplyOptions } from "@sapphire/decorators";
import type { Args } from "@sapphire/framework";
import type { Message } from "discord.js";
// import validator from "validator";

@ApplyOptions<CommandOptions>({
    aliases: [],
    description: "Basic description.",
    detailedDescription: "A more lengty continuation of the description.",
    examples: ["test"],
    usage: "",
    preconditions: ["OwnerOnly"],
    // preconditions: ["OwnerOnly", "InVoiceChannel"],
    flags: [],
    options: ["testFlag"],
    requiredClientPermissions: [],
    requiredUserPermissions: [],
})
export class TestCommand extends Command {
    public async messageRun(message: Message, args: Args): Promise<Message | void> {
        // const testArg = await this.handleArgs(
        //     args.pick("integer", { minimum: 0, maximum: 15 }),
        //     "The provided number must be between 0 and 15. Arigatothank you.",
        // );
        const testArg = await args.getOption("testFlag");
        console.log(testArg);
        // this.container.client.emit("guildMemberAdd", message.member);
        // return message.channel.send({
        //     content: `<@${message.author.id}>`,
        //     files: [
        //         {
        //             attachment: resCanvas,
        //             name: "test.png",
        //         },
        //     ],
        // });
        // const pickedRole: Role | null = await args.pick("role").catch(() => null);
        // if (!pickedRole) {
        //     return await message.channel.send("No role found. Please try again with a valid role.");
        // }
        // message.guild.members.cache.get(message.author.id).roles.add(pickedRole);
        // console.log(message.author);
        // console.log(Resolvers.resolveChannel("593722710148907028", message));
        // console.log(Resolvers.resolveGuildChannel("xp-logs", message.guild));
        // message.guild.members.cache.get(message.author.id).roles.add("760172996307714048");
    }
}
