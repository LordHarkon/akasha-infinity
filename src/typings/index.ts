import type { CommandJSON, CommandOptions } from "@sapphire/framework";
import type { PieceOptions } from "@sapphire/pieces";
import { PieceJSON } from "@sapphire/pieces";
import type { SubCommandPluginCommandOptions } from "@sapphire/plugin-subcommands";

export interface AkashaCommandOptions extends CommandOptions {
    examples?: string[];
    usage?: string;
}

export interface AkashaSubCommandOptions extends SubCommandPluginCommandOptions {
    examples?: string[];
    usage?: string;
}

export interface AkashaCommandJSON extends CommandJSON {
    examples?: string | Readonly<string[]>;
    usage?: string;
}

interface BaseTaskOptions extends PieceOptions {
    immediate?: boolean;
}

export type TaskOptions =
    | (BaseTaskOptions & { cron: string } & { interval?: never })
    | (BaseTaskOptions & { cron?: never } & { interval: number });

export interface TaskJSON extends PieceJSON {
    interval: number | undefined;
    cron: string | undefined;
}
