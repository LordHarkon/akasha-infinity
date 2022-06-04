import type { BucketScope, CommandJSON as BaseCommandJSON, CommandOptions as BaseCommandOptions } from "@sapphire/framework";
import type { PieceOptions } from "@sapphire/pieces";
import { PieceJSON } from "@sapphire/pieces";
import type { SubCommandPluginCommandOptions } from "@sapphire/plugin-subcommands";
import type { Snowflake } from "discord.js";

export interface CommandOptions extends BaseCommandOptions {
    examples?: string[];
    usage?: string;
    cooldown?: CooldownOptions;
}

export interface SubCommandOptions extends SubCommandPluginCommandOptions {
    examples?: string[];
    usage?: string;
}

export interface CommandJSON extends BaseCommandJSON {
    examples?: string | Readonly<string[]>;
    usage?: string;
    cooldown?: CooldownOptions;
}

interface BaseTaskOptions extends PieceOptions {
    immediate?: boolean;
}

export type TaskOptions = (BaseTaskOptions & { cron: string } & { interval?: never }) | (BaseTaskOptions & { cron?: never } & { interval: number });

export interface TaskJSON extends PieceJSON {
    interval: number | undefined;
    cron: string | undefined;
}

export interface CooldownOptions {
    scope?: BucketScope;
    delay?: number;
    premiumDelay?: number;
    limit?: number;
    filteredUsers?: Snowflake[];
}
