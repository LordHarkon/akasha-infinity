import { RateLimitManager } from "@sapphire/ratelimits";
import { BucketScope, Command, Precondition, PreconditionContext, Identifiers } from "@sapphire/framework";
import type { Message, Snowflake } from "discord.js";
import UserModel from "#models/User";
import { convertTime } from "#lib/utils";

export interface CustomCooldownContext extends PreconditionContext {
    scope?: BucketScope;
    delay?: number;
    premiumDelay?: number;
    limit?: number;
    filteredUsers?: Snowflake[];
}

export class CustomCooldown extends Precondition {
    public buckets = new WeakMap<Command, RateLimitManager>();

    public async run(message: Message, command: Command, context: CustomCooldownContext) {
        if (context.external) return this.ok();

        if (!context.delay) return this.ok();

        if (context.filteredUsers?.includes(message.author.id)) return this.ok();

        const user = await UserModel.findOne({ id: message.author.id });
        const premium = user.premium();

        const ratelimit = this.getManager(command, context, premium).acquire(this.getId(message, context));

        if (ratelimit.limited) {
            const remaining = ratelimit.remainingTime;

            setTimeout(() => this.buckets.delete(command), remaining);

            return this.error({
                identifier: Identifiers.PreconditionCooldown,
                message: `command is on cooldown for another \`${convertTime(remaining)}\`.`,
                context: { remaining },
            });
        }

        ratelimit.consume();
        return this.ok();
    }

    private getId(message: Message, context: CustomCooldownContext) {
        switch (context.scope) {
            case BucketScope.Global:
                return "global";
            case BucketScope.Channel:
                return message.channel.id;
            case BucketScope.Guild:
                return message.guild?.id ?? message.channel.id;
            default:
                return message.author.id;
        }
    }

    private getManager(command: Command, context: CustomCooldownContext, premium: boolean) {
        let manager = this.buckets.get(command);

        if (!manager) {
            const delay = premium ? (context.premiumDelay ? context.premiumDelay : context.delay) : context.delay;
            manager = new RateLimitManager(delay, context.limit);
            this.buckets.set(command, manager);
        }

        return manager;
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        CustomCooldown: CustomCooldownContext;
    }
}
