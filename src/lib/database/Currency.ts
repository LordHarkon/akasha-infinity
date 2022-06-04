import UserModel, { UserDocument } from "#models/User";
import GuildUserModel, { IGuildUserBank, GuildUserDocument } from "#models/GuildUser";
import type { User as UserType, Guild as GuildType, AllowedImageSize } from "discord.js";
import { container } from "@sapphire/pieces";

export default class Currency {
    protected _user: UserType;
    protected _guild: GuildType;
    protected _bank?: IGuildUserBank;
    protected _initialized: boolean;

    public constructor(user: UserType, guild: GuildType) {
        this._user = user;
        this._guild = guild;
        this._initialized = false;
    }

    // Initialize the currency system by fetching the user's data
    public async initialize(): Promise<void> {
        await this.getUserData();
        this._initialized = true;
    }

    // Status of the intialization process
    public get initialized(): boolean {
        return this._initialized;
    }

    // Internal check to see if the currency system has been initialized
    // If not, throw an error
    protected initializedCheck(): void {
        if (!this._initialized) throw new Error("Currency not initialized. Please use the initialize() method.");
    }

    public async add(amount: number): Promise<IGuildUserBank> {
        this.initializedCheck();
        this._bank.money += amount;
        this._bank.totalMoney += amount;
        if (this._bank.money < 0) this._bank.money = 0;
        await this.save();
        return this._bank;
    }

    public async remove(amount: number): Promise<IGuildUserBank> {
        this.initializedCheck();
        this._bank.money -= amount;
        if (this._bank.money < 0) this._bank.money = 0;
        await this.save();
        return this._bank;
    }

    public get user(): UserType {
        return this._user;
    }

    public get guild(): GuildType {
        return this._guild;
    }

    public get currentAmount(): number {
        return this._bank.money;
    }

    public get totalAmount(): number {
        return this._bank.totalMoney;
    }

    // TODO: Add functions to calculate how rich the user is like the old one (Middle Class, Capitalist, etc)

    public static async moneyLeaderboard(guildId: string, limit?: number): Promise<GuildUserDocument[]> | null {
        if (guildId) {
            return await GuildUserModel.find({ guildId })
                .populate<{ user: UserDocument }>("user")
                .sort({ bank: { money: -1 } })
                .limit(limit || 10);
        } else {
            return await GuildUserModel.find({})
                .populate<{ user: UserDocument }>("user")
                .sort({ bank: { money: -1 } })
                .limit(limit || 10);
        }
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

            this._bank = guildUser.bank;
        } catch (error: unknown) {
            container.logger.error((error as Error).stack);
        }
    }

    protected async save(): Promise<void> {
        try {
            await GuildUserModel.findOneAndUpdate(
                { id: this._user.id, guildId: this._guild.id }, // Query
                { $set: { bank: this._bank } }, // Update
            );
        } catch (error: unknown) {
            container.logger.error((error as Error).stack);
        }
    }
}
