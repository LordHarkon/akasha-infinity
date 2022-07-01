import { removeDuplicates } from "#lib/utils";
import SettingsModel, { IGreetingMessage, ILogOptions, IReward, ISettings, SettingsDocument } from "#models/Settings";
import { container } from "@sapphire/pieces";
import { Guild as GuildType, SnowflakeUtil } from "discord.js";

export default class Settings {
    protected _guild: GuildType;
    protected _settings: SettingsDocument;
    protected _initialized: boolean;

    public constructor(guild: GuildType) {
        this._guild = guild;
        this._initialized = false;
    }

    /**
     * Initialize the user system by fetching the settings
     */
    public async init(): Promise<void> {
        await this.getData();
        this._initialized = true;
    }

    /**
     * Status of the initialization process.
     */
    public get initialized(): boolean {
        return this._initialized;
    }

    /**
     * Internal check to see if the settings system has been initialized
     * If not, throw an error
     */
    protected initializedCheck(): void {
        if (!this._initialized) throw new Error("Settings not initialized. Please use the initialize() method.");
    }

    /**
     * It returns the settings object.
     * @returns {ISettings} The settings object.
     */
    public get settings(): ISettings {
        this.initializedCheck();
        return { ...this._settings.toJSON() };
    }

    public get prefix(): string {
        this.initializedCheck();
        return "inf.";
        // return this._settings.prefix;
    }

    public get language(): string {
        this.initializedCheck();
        return this._settings.language;
    }

    public get logOptions(): ILogOptions {
        this.initializedCheck();
        return this._settings.logOptions;
    }

    public get experienceLogsChannel(): string {
        this.initializedCheck();
        return this._settings.experienceLogsChannel;
    }

    public get membersCountChannel(): string {
        this.initializedCheck();
        return this._settings.membersCountChannel;
    }

    public get generalLogsChannel(): string {
        this.initializedCheck();
        return this._settings.generalLogsChannel;
    }

    public get moderationLogsChannel(): string {
        this.initializedCheck();
        return this._settings.moderationLogsChannel;
    }

    public get welcomeChannel(): string {
        this.initializedCheck();
        return this._settings.welcomeChannel;
    }

    public get goodbyeChannel(): string {
        this.initializedCheck();
        return this._settings.goodbyeChannel;
    }

    public get suggestionsChannel(): string {
        this.initializedCheck();
        return this._settings.suggestionsChannel;
    }

    public get administratorRoles(): string[] {
        this.initializedCheck();
        return this._settings.administratorRoles;
    }

    public get moderatorRoles(): string[] {
        this.initializedCheck();
        return this._settings.moderatorRoles;
    }

    public get welcomeMessages(): IGreetingMessage[] {
        this.initializedCheck();
        return this._settings.welcomeMessages;
    }

    public get goodbyeMessages(): IGreetingMessage[] {
        this.initializedCheck();
        return this._settings.goodbyeMessages;
    }

    public get rewards(): IReward[] {
        this.initializedCheck();
        return this._settings.customRewards;
    }

    public async setPrefix(prefix: string): Promise<void> {
        this.initializedCheck();
        this._settings.prefix = prefix;
        await this.save();
    }

    public async changeLanguage(language: string): Promise<void> {
        this.initializedCheck();
        this._settings.language = language;
        await this.save();
    }

    public async setMessageUpdateLog(bool?: boolean): Promise<void> {
        this.initializedCheck();
        this._settings.logOptions.logMessageUpdates = bool ?? !this._settings.logOptions.logMessageUpdates;
        await this.save();
    }

    public async setMessageDeleteLog(bool?: boolean): Promise<void> {
        this.initializedCheck();
        this._settings.logOptions.logMessageDeletions = bool ?? !this._settings.logOptions.logMessageDeletions;
        await this.save();
    }

    public async setExperienceLogsChannel(channel: string): Promise<void> {
        this.initializedCheck();
        this._settings.experienceLogsChannel = channel;
        await this.save();
    }

    public async setMembersCountChannel(channel: string): Promise<void> {
        this.initializedCheck();
        this._settings.membersCountChannel = channel;
        await this.save();
    }

    public async setGeneralLogsChannel(channel: string): Promise<void> {
        this.initializedCheck();
        this._settings.generalLogsChannel = channel;
        await this.save();
    }

    public async setModerationLogsChannel(channel: string): Promise<void> {
        this.initializedCheck();
        this._settings.moderationLogsChannel = channel;
        await this.save();
    }

    public async setWelcomeChannel(channel: string): Promise<void> {
        this.initializedCheck();
        this._settings.welcomeChannel = channel;
        await this.save();
    }

    public async setGoodbyeChannel(channel: string): Promise<void> {
        this.initializedCheck();
        this._settings.goodbyeChannel = channel;
        await this.save();
    }

    public async setSuggestionsChannel(channel: string): Promise<void> {
        this.initializedCheck();
        this._settings.suggestionsChannel = channel;
        await this.save();
    }

    public async addAdministratorRole(role: string): Promise<void> {
        this.initializedCheck();
        this._settings.administratorRoles.push(role);
        await this.save();
    }

    public async addAdministratorRoles(roles: string[]): Promise<void> {
        this.initializedCheck();
        this._settings.administratorRoles = removeDuplicates([...this._settings.administratorRoles, ...roles]);
        await this.save();
    }

    public async removeAdministratorRole(role: string): Promise<void> {
        this.initializedCheck();
        this._settings.administratorRoles = this._settings.administratorRoles.filter((r) => r !== role);
        await this.save();
    }

    public async removeAdministratorRoles(roles: string[]): Promise<void> {
        this.initializedCheck();
        this._settings.administratorRoles = this._settings.administratorRoles.filter((r) => !roles.includes(r));
        await this.save();
    }

    public async addModeratorRole(role: string): Promise<void> {
        this.initializedCheck();
        this._settings.moderatorRoles.push(role);
        await this.save();
    }

    public async addModeratorRoles(roles: string[]): Promise<void> {
        this.initializedCheck();
        this._settings.moderatorRoles = removeDuplicates([...this._settings.moderatorRoles, ...roles]);
        await this.save();
    }

    public async removeModeratorRole(role: string): Promise<void> {
        this.initializedCheck();
        this._settings.moderatorRoles = this._settings.moderatorRoles.filter((r) => r !== role);
        await this.save();
    }

    public async removeModeratorRoles(roles: string[]): Promise<void> {
        this.initializedCheck();
        this._settings.moderatorRoles = this._settings.moderatorRoles.filter((r) => !roles.includes(r));
        await this.save();
    }

    public async addCustomReward(reward: IReward): Promise<IReward[]> {
        this.initializedCheck();
        this._settings.customRewards.push(reward);
        await this.save();
        return this._settings.customRewards;
    }

    public async removeCustomReward(reward: IReward): Promise<IReward[]> {
        this.initializedCheck();
        this._settings.customRewards = this._settings.customRewards.filter((r) => r.id !== reward.id);
        await this.save();
        return this._settings.customRewards;
    }

    public async addWelcomeMessage(message: string): Promise<void> {
        this.initializedCheck();
        this._settings.welcomeMessages.push({
            id: SnowflakeUtil.generate(),
            message,
        });
        await this.save();
    }

    public async removeWelcomeMessage(id: string): Promise<void> {
        this.initializedCheck();
        this._settings.welcomeMessages = this._settings.welcomeMessages.filter((m) => m.id !== id);
        await this.save();
    }

    public async addGoodbyeMessage(message: string): Promise<void> {
        this.initializedCheck();
        this._settings.goodbyeMessages.push({
            id: SnowflakeUtil.generate(),
            message,
        });
        await this.save();
    }

    public async removeGoodbyeMessage(id: string): Promise<void> {
        this.initializedCheck();
        this._settings.goodbyeMessages = this._settings.goodbyeMessages.filter((m) => m.id !== id);
        await this.save();
    }

    public get randomWelcomeMessage(): string {
        this.initializedCheck();
        return this._settings.welcomeMessages.length > 0
            ? this._settings.welcomeMessages[Math.floor(Math.random() * this._settings.welcomeMessages.length)].message
            : "";
    }

    public get randomGoodbyeMessage(): string {
        this.initializedCheck();
        return this._settings.goodbyeMessages.length > 0
            ? this._settings.goodbyeMessages[Math.floor(Math.random() * this._settings.goodbyeMessages.length)].message
            : "";
    }

    protected async getData(): Promise<void> {
        try {
            let settings = await SettingsModel.findOne({ guildId: this._guild.id });

            if (!settings) {
                settings = new SettingsModel({
                    guildId: this._guild.id,
                });

                await settings.save();
            }

            this._settings = settings;
        } catch (error: unknown) {
            container.logger.error((error as Error).stack);
        }
    }

    protected async save(): Promise<void> {
        try {
            await this._settings.save();
        } catch (error: unknown) {
            container.logger.error((error as Error).stack);
        }
    }
}
