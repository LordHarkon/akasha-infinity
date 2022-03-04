// Config must always be first
import "reflect-metadata";
import "#root/config";

import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-editable-commands/register";

import * as colorette from "colorette";
import { inspect } from "util";

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
colorette.createColors({ useColor: true });
