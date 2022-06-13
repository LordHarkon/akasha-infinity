import { WebhookClient } from "discord.js";

let webhookInstance: WebhookClient = null;

export function useGuildWebhook() {
    webhookInstance ??= new WebhookClient({ url: process.env.GUILD_WEBHOOK_URL! });

    return webhookInstance;
}
