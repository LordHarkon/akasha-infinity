// Config must always be first
import "reflect-metadata";
import "#config";

import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-i18next/register";
import "@sapphire/plugin-editable-commands/register";
import "@sapphire/plugin-pattern-commands/register";
/**
 * TODO: Fix this
 * @kaname-png/plugin-statcord is currently crashing the bot after 20-60 minutes of uptime. Currently, disabled.
 */
// import "@kaname-png/plugin-statcord/register";

import { container } from "@sapphire/framework";
import { Colorette, createColors } from "colorette";

// Enable colorette
container.colors = createColors({ useColor: true });

declare module "@sapphire/pieces" {
    interface Container {
        colors: Colorette;
    }
}
