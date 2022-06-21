import { ApplyOptions } from "@sapphire/decorators";
import type { SubCommandOptions } from "#typings/index";
import type { Message } from "discord.js";
import { SubCommand } from "#structures/SubCommand";
import type { Args } from "@sapphire/framework";

// interface SettingArgument {
//     name: string;
//     type: string;
//     subtype?: any;
//     description: string;
//     message: string;
//     default?: any;
//     validators?: Array<[Function, string]>;
// }

// const settingArguments: SettingArgument[] = [
//     {
//         name: "welcomeChannel",
//         type: "channel",
//         description: "The channel to send the welcome message in.",
//         message: "Please provide a valid text channel.",
//         default: null,
//         validators: [],
//     },
//     {
//         name: "goodbyeChannel",
//         type: "channel",
//         description: "The channel to send the goodbye message in.",
//         message: "Please provide a valid text channel.",
//         default: null,
//         validators: [],
//     },
//     {
//         name: "experienceLogsChannel",
//         type: "channel",
//         description: "The channel to send the experience logs in.",
//         message: "Please provide a valid text channel.",
//         default: null,
//         validators: [],
//     },
//     {
//         name: "membersCountChannel",
//         type: "channel",
//         description: "The channel to set the name to the number of members.",
//         message: "Please provide a valid text/voice channel.",
//         default: null,
//         validators: [],
//     },
//     {
//         name: "generalLogsChannel",
//         type: "channel",
//         description: "The channel to send the general logs in.",
//         message: "Please provide a valid text channel.",
//         default: null,
//         validators: [],
//     },
//     {
//         name: "moderationLogsChannel",
//         type: "channel",
//         description: "The channel to send the moderation logs in.",
//         message: "Please provide a valid text channel.",
//         default: null,
//         validators: [],
//     },
//     {
//         name: "suggestionsChannel",
//         type: "channel",
//         description: "The channel to send the suggestions in.",
//         message: "Please provide a valid text channel.",
//         default: null,
//         validators: [],
//     },
//     {
//         name: "administratorRoles",
//         type: "role",
//         description: "The roles that can use the administrator commands.",
//         message: "Please provide a valid role.",
//         default: [],
//         validators: [],
//     },
//     {
//         name: "moderatorRoles",
//         type: "role",
//         description: "The roles that can use the moderator commands.",
//         message: "Please provide a valid role.",
//         default: [],
//     },
//     {
//         name: "welcomeMessages",
//         type: "string",
//         description: "The welcome messages to send.",
//         message: "Please provide a valid welcome message.",
//         default: [],
//         validators: [],
//     },
//     {
//         name: "goodbyeMessages",
//         type: "string",
//         description: "The goodbye messages to send.",
//         message: "Please provide a valid goodbye message.",
//         default: [],
//     },
//     {
//         name: "customRewards",
//         type: "object",
//         subtype: {
//             levelRequired: "number",
//             reward: "string",
//             rewardType: "string",
//         },
//         description: "The custom rewards for reaching certain levels.",
//         message: "Please provide a valid custom reward.",
//         default: [],
//         validators: [],
//     },
// ];

@ApplyOptions<SubCommandOptions>({
    name: "settings",
    examples: ["settings"],
    preconditions: [
        "GuildOnly",
        "AdministratorOnly",
        {
            name: "CustomCooldown",
            context: {
                delay: 1000,
            },
        },
    ],
    requiredClientPermissions: [],
    requiredUserPermissions: ["ADMINISTRATOR"],
    subCommands: ["add", "reset", "set", { input: "show", default: true }],
})
export class SettingsCommand extends SubCommand {
    // protected async awaitMessage(message: Message, type?: any, options?: SettingArgument) {
    //     return await message.channel.awaitMessages({
    //         filter: (msg) => msg.author.id === message.author.id,
    //         max: 1,
    //         time: 30000,
    //         errors: ["time"],
    //     });
    // }

    public async add(message: Message, args: Args) {
        // const testArg = await this.awaitMessage(message);
        // message.channel.send(testArg.first().content);
        // console.log(testArg);
        const testArg = await this.handleArgs(
            args.pick("integer", { minimum: 0, maximum: 15 }),
            "The provided number must be between 0 and 15. Arigatothank you.",
        );

        message.channel.send(testArg.toString());
    }

    public async reset(message: Message) {
        message.channel.send("Reset thing");
    }

    public async set(message: Message) {
        message.channel.send("Set thing");
    }

    public async show(message: Message) {
        message.channel.send("Show thing");
    }
}
