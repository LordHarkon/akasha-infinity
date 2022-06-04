import { Events, Listener, PieceContext, Resolvers } from "@sapphire/framework";
import type { GuildMember } from "discord.js";
import Settings from "#lib/database/Settings";
import User from "#lib/database/User";

export class GuildMemberAdd extends Listener<typeof Events.GuildMemberAdd> {
    public constructor(context: PieceContext) {
        super(context, {
            name: "guildMemberAdd",
            event: Events.GuildMemberAdd,
            once: false,
        });
    }

    async run(member: GuildMember) {
        const user = new User(member.user, member.guild);
        await user.init();
        const settings = new Settings(member.guild);
        await settings.init();

        await user.toggleJoined(true);

        if (settings.welcomeChannel) {
            const channel = Resolvers.resolveGuildTextChannel(settings.welcomeChannel, member.guild)?.value;
            if (channel) {
                const welcomeMessage = settings.randomWelcomeMessage;
                if (welcomeMessage) channel.send(welcomeMessage.replace(/{user}/g, `<@${member.id}>`));
                else channel.send(`Welcome to the server, ${member}!`);
            }
        }
    }
}
