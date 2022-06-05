import type { PieceContext } from "@sapphire/framework";
import { Piece } from "@sapphire/pieces";
import cron from "node-cron";
import { Events } from "#typings/sapphire";
import type { TaskJSON, TaskOptions } from "#typings/index";

/**
 * The base task class. This class is abstract and is to be extended by subsclasses, which should implement the methods.
 * In our worlkflow, tasks are run at the specified interval.
 *
 * @example
 * // Typscript
 * import { Task } from "#structures/Task";
 * import { ApplyOptions } from "@sapphire/decorators";
 * import type { TaskOptions } from "#typings/index";
 *
 * // Define a class extending `Task`, then export it.
 * // You can use a interval in milliseconds
 * (at)ApplyOptions<TaskOptions>({ interval: 10_000 })
 * // or a cron
 * (at)ApplyOptions<TaskOptions>({ cron: "* * * * *" })
 * export default class MyTask extends Task {
 *     public run(): void {
 *         this.container.logger.info("Task ran!");
 *     }
 * }
 *
 */

export default abstract class Task extends Piece {
    public readonly interval?: number;
    public readonly cron?: string;
    public readonly immediate: boolean;

    private _scheduleInterval: NodeJS.Timeout;
    private _scheduleCron: cron.ScheduledTask;
    private readonly _callback: (() => Promise<void>) | null;

    protected constructor(context: PieceContext, options: TaskOptions) {
        super(context, options);

        this.interval = options.interval;
        this.cron = options.cron;
        this.immediate = options.immediate ?? false;
        this._callback = this._run.bind(this);
    }

    public onLoad(): void {
        if (this.interval) this._scheduleInterval = setInterval(this._callback, this.interval);
        if (this.cron) this._scheduleCron = cron.schedule(this.cron, this._callback);

        if (this.immediate) void this._callback;
    }

    public onUnload(): void {
        if (this._scheduleInterval) clearInterval(this._scheduleInterval);
        if (this._scheduleCron) this._scheduleCron.stop();
    }

    public toJSON(): TaskJSON {
        return {
            ...super.toJSON(),
            interval: this.interval,
            cron: this.cron,
        };
    }

    private async _run(): Promise<void> {
        try {
            await this.run();
        } catch (error: unknown) {
            this.container.client.emit(Events.TaskError, error as Error, { piece: this });
        }
    }

    public abstract run(): unknown;
}
