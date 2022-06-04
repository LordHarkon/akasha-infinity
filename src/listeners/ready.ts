import { ListenerOptions, PieceContext, Resolvers } from "@sapphire/framework";
import { Listener, Store } from "@sapphire/framework";
import { gray, magenta, blue, yellow, green, magentaBright, white } from "colorette";

const version = process.env.VER;
const dev = process.env.NODE_ENV !== "production";

export class UserEvent extends Listener {
    private readonly style = dev ? yellow : blue;

    public constructor(context: PieceContext, options?: ListenerOptions) {
        super(context, {
            ...options,
            once: true,
        });
    }

    public async run() {
        this.printStoreDebugInformation();
        this.printBanner();

        const time = new Date().toLocaleDateString("ro-RO", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        // TODO: Remove this in production
        Resolvers.resolveGuildTextChannel(
            "478556102385074176",
            this.container.client.guilds?.cache.get("445572484469751808"),
        ).value.send(`Gateway ready! - ${time}`);
    }

    private printBanner() {
        const success = green("+");

        const llc = dev ? magentaBright : white;
        const blc = dev ? magenta : blue;

        this.container.logger.info(`${blc("[")}${success}${blc("]")} ${blc("Gateway")}`);
        if (dev) this.container.logger.info(dev ? `${blc("<")}${llc("/")}${blc(">")} ${llc("DEVELOPMENT MODE")}` : "");
        this.container.logger.info(`Version: ${blc(version)}`);
    }

    private printStoreDebugInformation() {
        const { client, logger } = this.container;
        const stores = [...client.stores.values()];
        const last = stores.pop()!;

        for (const store of stores) logger.info(this.styleStore(store, false));
        logger.info(this.styleStore(last, true));
    }

    private styleStore(store: Store<any>, last: boolean) {
        return gray(`${last ? "└─" : "├─"} Loaded ${this.style(store.size.toString().padEnd(3, " "))} ${store.name}.`);
    }
}
