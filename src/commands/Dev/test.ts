import { Command } from "#lib/structures/Command";
import { formatNumber } from "#lib/utils";
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
    options: [],
    requiredClientPermissions: [],
    requiredUserPermissions: [],
})
export class TestCommand extends Command {
    public async messageRun(message: Message, args: Args): Promise<Message | void> {
        function upperBound(level) {
            return Math.ceil((level / 0.24) ** 2);
        }

        const testValue = new Array(63).fill().reduce((p, c, i) => p + upperBound(i), 0);

        message.channel.send(formatNumber(testValue));
        // const member = await args.pick("member").catch(() => message.member);
        // console.log(member.permissions.has("ADMINISTRATOR"));
        // this.container.client.emit("guildCreate", message.guild);
        // this.container.client.emit("guildDelete", message.guild);
        // const testPrompter = new MessagePrompter("Can you give me a number?");
        // const result = await testPrompter.run(message.channel, message.author);
        // console.log("A1", result);
        // const testPromptNumber = new MessagePrompter("Choose between 1 and 10.", "number", {
        //     start: 1,
        //     end: 10,
        // });
        // const resultNumber = await testPromptNumber.run(message.channel, message.author);
        // console.log("A2", resultNumber);
        // const testArg = await this.handleArgs(
        //     args.pick("integer", { minimum: 0, maximum: 15 }),
        //     "The provided number must be between 0 and 15. Arigatothank you.",
        // );
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
