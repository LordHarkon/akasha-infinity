import type { Events, ListenerOptions, PieceContext } from "@sapphire/framework";
import { Listener, Store } from "@sapphire/framework";
import { Permissions } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { capitalize } from "#lib/utils";

export class UserEvent extends Listener<typeof Events.ClientReady> {
    public constructor(context: PieceContext, options?: ListenerOptions) {
        super(context, {
            ...options,
            once: true,
        });
    }

    public async run() {
        this.printBanner();
    }

    private printBanner() {
        const { colors, logger, client } = this.container;
        const stores = [...client.stores.values()];

        const logoAscii = [
            "#### ##    ## ######## #### ##    ## #### ######## ##    ##",
            " ##  ###   ## ##        ##  ###   ##  ##     ##     ##  ## ",
            " ##  ####  ## ##        ##  ####  ##  ##     ##      ####  ",
            " ##  ## ## ## ######    ##  ## ## ##  ##     ##       ##   ",
            " ##  ##  #### ##        ##  ##  ####  ##     ##       ##   ",
            " ##  ##   ### ##        ##  ##   ###  ##     ##       ##   ",
            "#### ##    ## ##       #### ##    ## ####    ##       ##   ",
        ].map((item) => colors.bold(colors.red(item)));

        /**
         * TODO: Change the 'Origin' part depending on the version.
         * *Origin is version 1.
         * *Prima Rose is version 2. Maybe. Idfk. I am just thinking of cool names.
         */
        const versionString = `${colors.redBright("Version: ")}${colors.green(process.env.VER || "Unknown")} ${colors.red("-")} ${colors.blueBright(
            "Infinity Origin",
        )}`;
        const botTag = `${colors.redBright("Logged in as: ")}${colors.cyan(client.user?.tag)} (${colors.green(client.user?.id)})`;
        const guildCount = `${colors.redBright("Guild count: ")}${colors.cyan(client.guilds.cache.size.toLocaleString() || "0")}`;
        const shardCount = `${colors.redBright("Shard count: ")}${colors.cyan(client.shard?.count?.toLocaleString() || "1")}`;
        const memberCount = `${colors.redBright("Member count: ")}${colors.cyan(
            client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toLocaleString(),
        )}`;
        const botInvite = `${colors.redBright("Invite application: ")}${colors.cyan(
            client.generateInvite({
                scopes: ["bot"],
                // scopes: ['bot', 'applications.commands']
                permissions: new Permissions([PermissionFlagsBits.Administrator]),
            }),
        )}`;
        const defaultPrefix = `${colors.redBright("Default Prefix: ")}${colors.cyan(process.env.PREFIX || "inf.")}`;

        const startMessages = [...logoAscii, "", versionString, "", botTag, guildCount, shardCount, memberCount, botInvite, defaultPrefix];

        for (const store of stores) startMessages.push(this.styleStore(store));

        for (const startMessage of startMessages) {
            // if (startMessage.includes("Invite application") && process.env.NODE_ENV === "development") continue;
            logger.info(startMessage);
        }
    }

    private styleStore(store: Store<any>) {
        const { colors } = this.container;

        return `${colors.redBright(`${capitalize(store.name)}: `)}${colors.cyan(store.size.toLocaleString())} `;
    }
}
