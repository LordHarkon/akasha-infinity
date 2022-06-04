import { arrayRemove } from "#lib/utils";
import GuildUserModel, {
    type AvailableGamesType,
    type GuildUserDocument,
    // type IActiveEffect,
    type IGameData,
    type IGameDataMoney,
    type IGuildUser,
    type IGuildUserStats,
    type IWarning,
} from "#models/GuildUser";
import UserModel, { type UserDocument, type IUser, type UserAccessLevels } from "#models/User";
import { container } from "@sapphire/pieces";
import type { User as UserType, Guild, AllowedImageSize } from "discord.js";

interface IResult {
    success: boolean;
    errorMessage?: string;
    oldValue?: unknown;
    newValue?: unknown;
}

export default class User {
    protected _user: UserType;
    protected _guild: Guild;
    protected _guildUserData: GuildUserDocument;
    protected _userData: UserDocument;
    protected _initialized: boolean;

    public constructor(user: UserType, guild: Guild) {
        this._user = user;
        this._guild = guild;
        this._initialized = false;
    }

    /**
     * Initializes the class.
     * No method will work without this one being called.
     */
    public async init(): Promise<void> {
        await this.getUserData();
        this._initialized = true;
    }

    /**
     * If the class has been initialized.
     */
    public get isInitialized(): boolean {
        return this._initialized;
    }

    /**
     * Internal check to see if the user system has been initialized
     * If not, throw an error
     */
    protected initializedCheck(): void {
        if (!this._initialized) throw new Error("User not initialized. Please use the initialize() method.");
    }

    /**
     * It returns the guild user object.
     * @returns {IGuildUser} The user object.
     */
    public get guildUser(): IGuildUser {
        this.initializedCheck();
        return { ...this._guildUserData.toJSON() };
    }

    /**
     * It returns the user object.
     * @returns {IUser} The user object.
     */
    public get user(): IUser {
        this.initializedCheck();
        return { ...this._userData.toJSON() };
    }

    /**
     * Check if the user has premium active.
     */
    public isPremium(): boolean {
        this.initializedCheck();
        return new Date(this._userData.premiumExpires) > new Date();
    }

    public get accessLevel(): number {
        this.initializedCheck();
        return this._userData.accessLevel;
    }

    public get messageCount(): number {
        this.initializedCheck();
        return this._guildUserData.stats.messages;
    }

    public get premiumExpiryDate(): Date {
        this.initializedCheck();
        return new Date(this._userData.premiumExpires);
    }

    public get isJoined(): boolean {
        this.initializedCheck();
        return this._guildUserData.joined;
    }

    public get gameData(): IGuildUserStats["games"] {
        this.initializedCheck();
        return this._guildUserData.stats.games;
    }

    public isBlacklisted(commandId: string): boolean {
        this.initializedCheck();
        return this._guildUserData.settings.blacklist.includes(commandId);
    }

    public async addBlacklistedCommand(commandId: string): Promise<void> {
        this.initializedCheck();
        this._guildUserData.settings.blacklist.push(commandId);
        await this.save();
    }

    public async removeBlacklistedCommand(commandId: string): Promise<void> {
        this.initializedCheck();
        arrayRemove(this._guildUserData.settings.blacklist, commandId);
        await this.save();
    }

    public async setAccessLevel(accessLevel: number): Promise<IResult> {
        this.initializedCheck();

        if (accessLevel < 1 || accessLevel > 3) {
            return {
                success: false,
                errorMessage: "Access level must be between 1 and 3.",
            };
        }

        const _accessLevel = this._userData.accessLevel;

        if (this._userData.accessLevel !== accessLevel) {
            this._userData.accessLevel = accessLevel as UserAccessLevels;
            await this.save();
        }

        return {
            success: true,
            oldValue: _accessLevel,
            newValue: accessLevel,
        };
    }

    /**
     * Add time to the user's premium expiry date.
     * @param time The time in milliseconds
     */
    public async addPremiumTime(time: number): Promise<void> {
        this.initializedCheck();

        if (this._userData.premiumExpires === null || this._userData.premiumExpires <= new Date()) {
            this._userData.premiumExpires = new Date(Date.now() + time);
            this._userData.premium = true;
        } else {
            this._userData.premiumExpires = new Date(this._userData.premiumExpires.getTime() + time);
            this._userData.premium = true;
        }

        await this.save();
    }

    /**
     * Set the user's username.
     */
    public async setUsername(username: string): Promise<IResult> {
        this.initializedCheck();

        if (username.length > 32) {
            return {
                success: false,
                errorMessage: "Username must be 32 characters or less.",
            };
        }
        if (username.length < 1) {
            return {
                success: false,
                errorMessage: "Username must be 1 character or more.",
            };
        }
        const _username = this._userData.username;
        this._userData.username = username;
        await this.save();
        return {
            success: true,
            oldValue: _username,
            newValue: username,
        };
    }

    /**
     * Update the avatar of the user
     */
    public async updateAvatar(): Promise<IResult> {
        this.initializedCheck();

        const avatar = this._user.displayAvatarURL({
            dynamic: true,
            size: 4096,
        });

        const _avatar = this._userData.avatar;

        if (this._userData.avatar !== avatar) {
            this._userData.avatar = avatar;
            await this.save();
        }

        return {
            success: true,
            oldValue: _avatar,
            newValue: avatar,
        };
    }

    /**
     * Set the background of the current user
     * @param {string} background - The background url.
     */
    public async setBackground(background: string): Promise<IResult> {
        this.initializedCheck();

        const _background = this._userData.background;

        if (this._userData.background !== background) {
            this._userData.background = background;
            await this.save();
        }

        return {
            success: true,
            oldValue: _background,
            newValue: background,
        };
    }

    /**
     * Set whether the user is still in the guild.
     * @param {boolean} bool
     */
    public async toggleJoined(bool?: boolean): Promise<IResult> {
        this.initializedCheck();

        const _joined = this._guildUserData.joined;

        if (!bool) {
            this._guildUserData.joined = !this._guildUserData.joined;
        } else {
            this._guildUserData.joined = bool;
        }

        await this.save();
        return {
            success: true,
            oldValue: _joined,
            newValue: this._guildUserData.joined,
        };
    }

    /**
     * Add a reward to the list of collected rewards
     * @param {string} reward - The ID of the reward.
     */
    public async addCollectedReward(reward: string): Promise<IResult> {
        this.initializedCheck();

        if (this._guildUserData.collectedRewards.includes(reward))
            return {
                success: false,
                errorMessage: "Reward already collected.",
            };

        this._guildUserData.collectedRewards.push(reward);

        await this.save();

        return {
            success: true,
            newValue: this._guildUserData.collectedRewards,
        };
    }

    /**
     * Add an active effect to the user.
     * If the effect already exists, it will be updated.
     * If the effect is active, the new duration will be added to the existing duration.
     * If the effect is permanent, it cannot be modified.
     * @param {IActiveEffect} effect - IActiveEffect
     * @param {boolean} override - boolean
     */
    // public async addActiveEffect(effect: IActiveEffect, override: boolean): Promise<IResult> {
    //     this.initializedCheck();
    //     // If the effect is already active and the effect has not ended, add the duration to the effect.
    //     let foundIndex = null;
    //     const activeEffect = this._guildUserData.activeEffects.find((activeEffect: IActiveEffect, index: number) => {
    //         if (activeEffect.id === effect.id) foundIndex = index;
    //         return activeEffect.id === effect.id;
    //     });

    //     // If the effect is permanent, it cannot be overriden.
    //     if (activeEffect && activeEffect.duration === 0) {
    //         return {
    //             success: false,
    //             errorMessage: "Permanent effects cannot be overridden.",
    //         };
    //     } else if (activeEffect && override) {
    //         // If the effect is already active and the effect has not ended, add the duration to the effect.
    //         if (activeEffect.end.getTime() > Date.now()) {
    //             activeEffect.duration += effect.duration;
    //             activeEffect.end = new Date(activeEffect.end.getTime() + effect.duration);
    //             // If the effect is already active and the effect has ended, replace the effect.
    //         } else {
    //             activeEffect.duration = effect.duration;
    //             activeEffect.start = new Date();
    //             activeEffect.end = new Date(Date.now() + effect.duration);
    //         }
    //         this._guildUserData.activeEffects[foundIndex] = activeEffect;
    //     } else if (activeEffect && !override && activeEffect.end.getTime() > Date.now()) {
    //         return {
    //             success: false,
    //             errorMessage: "Effect already active. Please use the override parameter.",
    //         };
    //     } else {
    //         this._guildUserData.activeEffects.push(effect);
    //     }

    //     await this.save();
    //     return {
    //         success: true,
    //         newValue: this._guildUserData.activeEffects,
    //     };
    // }

    /**
     * Raise the message count by one or the specified amount
     * @param {number} [count] - The number of messages to raise the count by.
     * @returns The number of messages of the user.
     */
    public async raiseMessageCount(count?: number): Promise<number> {
        this.initializedCheck();
        this._guildUserData.stats.messages += count || 1;
        await this.save();
        return this._guildUserData.stats.messages;
    }

    /**
     * Lower the message count by one or by the specified amount
     * @param {number} [count] - The number of messages to lower the count by.
     * @returns The number of messages of the user.
     */
    public async lowerMessageCount(count?: number): Promise<number> {
        this.initializedCheck();
        this._guildUserData.stats.messages -= count || 1;
        await this.save();
        return this._guildUserData.stats.messages;
    }

    /**
     * It modifies the game statistics of the user.
     * @param {AvailableGamesType} game - The game to modify the statistics of.
     * @param {boolean} won - Whether the game was won or lost.
     * @param {number} [amount] - The amount of money won or lost.
     * @returns The statistics of the game of the user.
     */
    public async gameCount(game: AvailableGamesType, won: boolean, amount?: number): Promise<IGameData | IGameDataMoney> {
        this.initializedCheck();

        if (!game) throw new Error("Please specify the game type.");
        if (!won) throw new Error("Please specify wether the game was lost or won.");

        this._guildUserData.stats.games[game].played += 1;

        if (won) {
            this._guildUserData.stats.games[game].won += 1;
        } else {
            this._guildUserData.stats.games[game].lost += 1;
        }

        if (amount && won && ["roulette", "slots"].includes(game)) {
            (this._guildUserData.stats.games[game] as IGameDataMoney).moneyWon += amount;
        } else if (amount && !won && ["roulette", "slots"].includes(game)) {
            (this._guildUserData.stats.games[game] as IGameDataMoney).moneyLost += amount;
        }

        await this.save();
        return this._guildUserData.stats.games[game];
    }

    /**
     * Add a command to the blacklist
     * @param {string} command - The command you want to blacklist. Use * for all commands.
     * @returns The list of blacklisted commands.
     */
    public async addCommandBlacklist(command: string): Promise<string[]> {
        this.initializedCheck();
        this._guildUserData.settings.blacklist.push(command);
        await this.save();
        return this._guildUserData.settings.blacklist;
    }

    /**
     * Remove a command from the blacklist
     * @param {string} command - The command you want to remove from the blacklist. Use * for all commands.
     * @returns The list of blacklisted commands.
     */
    public async removeCommandBlacklist(command: string): Promise<string[]> {
        this.initializedCheck();
        if (command === "*") {
            this._guildUserData.settings.blacklist = [];
        } else {
            this._guildUserData.settings.blacklist = arrayRemove(this._guildUserData.settings.blacklist, command);
        }
        await this.save();
        return this._guildUserData.settings.blacklist;
    }

    /**
     * Add a warning to the warnings list of the user.
     * @param {IWarning} warning - The warning to add.
     * @returns The updated warnings array.
     */
    public async addWarning(warning: IWarning): Promise<IWarning[]> {
        this.initializedCheck();
        this._guildUserData.moderation.warnings.push(warning);
        await this.save();
        return this._guildUserData.moderation.warnings;
    }

    /**
     * Remove a warning from the warnings list of the user.
     * @param {string} warningId - The id of the warning to remove.
     * @returns The updated warnings array.
     */
    public async removeWarning(warningId: string): Promise<IWarning[]> {
        this.initializedCheck();
        const warning = this._guildUserData.moderation.warnings.find((warning: IWarning) => warning.id === warningId);
        this._guildUserData.moderation.warnings = arrayRemove(this._guildUserData.moderation.warnings, warning);
        await this.save();
        return this._guildUserData.moderation.warnings;
    }

    /**
     * Raise the number of times a user has been kicked.
     * @returns The number of times the user has been kicked.
     */
    public async raiseKicksCount(): Promise<number> {
        this.initializedCheck();
        this._guildUserData.moderation.kicks += 1;
        await this.save();
        return this._guildUserData.moderation.kicks;
    }

    /**
     * Raise the number of times a user has been banned.
     * @returns The number of times the user has been banned.
     */
    public async raiseBansCount(): Promise<number> {
        this.initializedCheck();
        this._guildUserData.moderation.bans += 1;
        await this.save();
        return this._guildUserData.moderation.bans;
    }

    /**
     * Get the user data from the database
     */
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

            this._guildUserData = guildUser;
            this._userData = user;
        } catch (error: unknown) {
            container.logger.error((error as Error).stack);
        }
    }

    /**
     * Save the data to the database.
     * The `save` function is called when the user object is updated.
     */
    protected async save(): Promise<void> {
        try {
            await this._guildUserData.save();
            await this._userData.save();
        } catch (error: unknown) {
            container.logger.error((error as Error).stack);
        }
    }
}
