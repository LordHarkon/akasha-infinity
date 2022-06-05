// Config must always be first
import "reflect-metadata";
import "#config";

import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-i18next/register";
import "@sapphire/plugin-editable-commands/register";
import "@kaname-png/plugin-statcord/register";

import * as colorette from "colorette";

// Enable colorette
colorette.createColors({ useColor: true });
