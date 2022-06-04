import UserModel, { UserDocument } from "#models/User";
import GuildUserModel, { type GuildUserDocument, type IGuildUserInventory } from "#models/GuildUser";
import { container } from "@sapphire/pieces";
import type { Types } from "mongoose";
import type { User as UserType, Guild as GuildType, AllowedImageSize } from "discord.js";

export interface InventoryResult {
    amount: number;
    status: "success" | "failure";
    message?: string;
}

export interface removalItemResult {
    original: number;
    used: number;
    remaining: number;
}

export default class Inventory {
    protected _user: UserType;
    protected _guild: GuildType;
    protected user: GuildUserDocument;
    protected _inventory?: IGuildUserInventory;
    protected _initialized: boolean;

    public constructor(user: UserType, guild: GuildType) {
        this._user = user;
        this._guild = guild;
        this._initialized = false;
    }

    public async initialize(): Promise<void> {
        await this.getUserData();
        this._initialized = true;
    }

    public get initialized(): boolean {
        return this._initialized;
    }

    protected initializedCheck(): void {
        if (!this._initialized) throw new Error("Inventory not initialized. Please use the initialize() method.");
    }

    public async add(item: Types.ObjectId, amount: number): Promise<IGuildUserInventory> {
        this.initializedCheck();

        if (!amount) {
            throw new Error("Please specify an amount");
        } else if (amount < 0) {
            throw new Error("Please specify a positive amount");
        }

        const _item = this._inventory.items.find((i) => i.item == item);

        if (_item) {
            _item.amount += amount;
        } else {
            if (this._inventory.items.length >= this._inventory.slots) {
                throw new Error("Inventory is full");
            }

            this._inventory.items.push({
                item,
                amount,
            });
        }

        await this.save();

        return this._inventory;
    }

    public async remove(item: Types.ObjectId, amount: number): Promise<removalItemResult> {
        this.initializedCheck();

        if (amount < 0) {
            throw new Error("Please specify a positive amount");
        }

        const _item = this._inventory.items.find((i) => i.item == item);
        const _itemIndex = this._inventory.items.indexOf(_item);

        if (_item) {
            if (_item.amount - amount < 0) {
                throw new Error("You cannot remove more items than you have");
            } else if (_item.amount - amount === 0) {
                this._inventory.items.splice(_itemIndex, 1);

                await this.save();

                return {
                    original: amount,
                    used: amount,
                    remaining: 0,
                };
            } else {
                _item.amount -= amount;
                this._inventory.items[_itemIndex] = _item;

                await this.save();

                return {
                    original: _item.amount + amount,
                    used: amount,
                    remaining: _item.amount,
                };
            }
        } else {
            throw new Error("Item not found in the inventory");
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

            this.user = guildUser;
            this._inventory = this.user.inventory;
        } catch (error: unknown) {
            container.logger.error((error as Error).stack);
        }
    }

    protected async save(): Promise<void> {
        try {
            this.user.inventory = this._inventory;
            await this.user.save();
        } catch (error: unknown) {
            container.logger.error((error as Error).stack);
        }
    }
}
