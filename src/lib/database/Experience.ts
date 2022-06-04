import GuildUserModel, { type GuildUserDocument } from "#models/GuildUser";
import UserModel, { type UserDocument } from "#models/User";
import type { AllowedImageSize, Guild as GuildType, User as UserType } from "discord.js";
import { container } from "@sapphire/pieces";
import Settings from "./Settings";
import { generateLevelUpImage } from "#lib/utils";
import { Resolvers } from "@sapphire/framework";

export default class Experience {
    protected _user: UserType;
    protected _guild: GuildType;
    protected _guildSettings: Settings;
    protected _experience?: number;
    protected _initialized: boolean;
    // TODO: Add a way to get the user data without having to initialize the experience system

    public constructor(user: UserType, guild: GuildType) {
        this._user = user;
        this._guild = guild;
        this._initialized = false;
    }

    /**
     * Initialize the experience system by fetching the user's data.
     */
    public async initialize(): Promise<void> {
        await this.getUserData();
        await this._guildSettings.init();
        this._initialized = true;
    }

    /**
     * Status of the initialization process.
     */
    public get initialized(): boolean {
        return this._initialized;
    }

    /**
     * Internal check to see if the experience system has been initialized
     * If not, throw an error
     */
    protected initializedCheck(): void {
        if (!this._initialized) throw new Error("Experience not initialized. Please use the initialize() method.");
    }

    protected checkExperience(): void {
        if (this._experience < 0) this._experience = 0;
    }

    public checkIfLevelUp(initialExperience?: number, finalExperience?: number): boolean | number {
        if (initialExperience && finalExperience && this.levelUntilExperience(initialExperience) < this.levelUntilExperience(finalExperience)) {
            return this.levelUntilExperience(finalExperience);
        } else {
            return false;
        }
    }

    private async levelUp(previousLevel: number): Promise<void> {
        const levelUpImage = await generateLevelUpImage(
            this._user,
            previousLevel,
            this.level,
            this.lowerBound,
            this.uppperBound,
            this.currentExperience,
        );

        if (this._guildSettings.experienceLogsChannel) {
            const logs = Resolvers.resolveGuildTextChannel(this._guildSettings.experienceLogsChannel, this._guild)?.value;

            logs.send({
                content: `Congratulations, ${this._user}! You've reached level **${this.level}**!`,
                files: [
                    {
                        attachment: levelUpImage,
                        name: "levelup.png",
                    },
                ],
            });
        }

        this._user.send({
            content: `Congratulations! You've reached level **${this.level}** on **${this._guild}**!`,
            files: [
                {
                    attachment: levelUpImage,
                    name: "levelup.png",
                },
            ],
        });
    }

    /**
     * Add experience to the user.
     * @param amount The amount of experience to add.
     * @returns Promise<number> The new amount of experience.
     */
    public async add(amount: number): Promise<number> {
        // TODO: Add a way to add experience without having to initialize the experience system
        // Probably by adding a method to the User model that adds experience
        this.initializedCheck();
        this.checkExperience();

        const previousLevel = this.level;
        this._experience += Math.abs(amount);
        this.checkExperience();

        if (previousLevel < this.level) this.levelUp(previousLevel);

        await this.save();
        return this._experience;
    }

    /**
     * Remove experience from the user.
     * @param amount The amount of experience to remove.
     * @returns Promise<number> The new amount of experience.
     */
    public async remove(amount: number): Promise<number> {
        // TODO: Add a way to remove experience without having to initialize the experience system
        // Probably by adding a method to the User model that removes experience
        this.initializedCheck();
        this.checkExperience();

        this._experience -= Math.abs(amount);
        this.checkExperience();

        await this.save();
        return this._experience;
    }

    public get user(): UserType {
        return this._user;
    }

    public get guild(): GuildType {
        return this._guild;
    }

    public get experience(): number {
        this.initializedCheck();
        return this._experience;
    }

    public get currentExperience(): number {
        this.initializedCheck();
        return this._experience - this.experienceUntilLevel(this.level - 1);
    }

    public get level(): number {
        this.initializedCheck();
        return this.levelUntilExperience(this._experience);
    }

    public get lowerBound(): number {
        this.initializedCheck();
        return Math.ceil(((this.level - 1) / 0.24) ** 2);
    }

    public get uppperBound(): number {
        this.initializedCheck();
        return Math.ceil((this.level / 0.24) ** 2);
    }

    protected experienceUntilLevel(level: number): number {
        let experience = 0;
        for (let i = 1; i <= level; i++) {
            experience += Math.ceil((i / 0.24) ** 2);
        }
        return experience;
    }

    protected levelUntilExperience(experience: number): number {
        let level = 0;
        while (experience >= this.experienceUntilLevel(level)) {
            level++;
        }
        return level;
    }

    public static calculateLevel(experience: number): number {
        return Math.floor(0.24 * Math.sqrt(experience)) + 1;
    }

    public static calculateLowerBound(level: number): number {
        return Math.ceil(((level - 1) / 0.24) ** 2);
    }

    public static calculateUpperBound(level: number): number {
        return Math.ceil((level / 0.24) ** 2);
    }

    /**
     * It returns the top 10 users with the highest experience.
     * @param {string} [guildId] - The guildId of the guild you want to get the leaderboard for.
     * @param {number} [limit=10] - The amount of users to return.
     * @returns An array of users.
     */
    public static async levelLeaderboard(guildId?: string, limit?: number): Promise<GuildUserDocument[]> | null {
        if (guildId) {
            return await GuildUserModel.find({ guildId })
                .sort({ experience: -1 })
                .limit(limit || 10);
        } else {
            return await GuildUserModel.find({})
                .sort({ experience: -1 })
                .limit(limit || 10);
        }
    }

    public async refreshUserData(): Promise<void> {
        this.initializedCheck();
        await this.getUserData();
    }

    protected async getUserData(): Promise<void> {
        try {
            let user = await UserModel.findOne({ id: this._user.id });

            if (!user) {
                user = new UserModel({
                    id: this._user.id,
                    username: this._user.username,
                    avatar: this._user.displayAvatarURL({
                        dynamic: true,
                        size: 4096 as AllowedImageSize,
                    }),
                });

                await user.save();
            }

            let guildUser = await GuildUserModel.findOne({ user: user._id, guildId: this._guild.id }).populate<{ user: UserDocument }>("user");

            if (!guildUser) {
                guildUser = new GuildUserModel({
                    user: user._id,
                    guildId: this._guild.id,
                });

                await guildUser.save();
            }

            this._guildSettings = new Settings(this._guild);
            this._experience = guildUser.experience;
        } catch (error: unknown) {
            container.logger.error((error as Error).stack);
        }
    }

    protected async save(): Promise<void> {
        try {
            await GuildUserModel.findOneAndUpdate(
                { id: this._user.id, guildId: this._guild.id }, // Query
                { $set: { experience: this._experience } }, // Update
            );
        } catch (error: unknown) {
            container.logger.error((error as Error).stack);
        }
    }
}
