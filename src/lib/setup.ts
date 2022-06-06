// Config must always be first
import "reflect-metadata";
import "#config";

import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-i18next/register";
import "@sapphire/plugin-editable-commands/register";
import "@kaname-png/plugin-statcord/register";

import { container } from "@sapphire/framework";
import { Colorette, createColors } from "colorette";

// Enable colorette
container.colors = createColors({ useColor: true });

declare module "@sapphire/pieces" {
    interface Container {
        colors: Colorette;
    }
}
