import connectDB from "#lib/databaseUtilities";
import "#lib/setup";
// import { LogLevel, SapphireClient } from "@sapphire/framework";
import { Client } from "#lib/structures/Client";

const client = new Client();

// TODO: Add premium system, add redeemable codes, add a way to get a code, add a way to generate codes
// TODO: Add a command that gives the selected role when reacting to the message from the bot
// TODO: Make a command `rewards` with the default being to see the rewards and maybe a subcommand `rewards list` which the command defaults to,
// *and a subcommand `rewards add` which adds a reward, but only works for someone with `ADMINISTRATOR` or `MANAGE_GUILD` permissions
// TODO: Add a chance for people to get random titles at certain levels. Make the titles themselves be random, using lists of options.
// TODO: Add command to re-give the role rewards to a user. Cooldown of 1 hour or maybe 1 day.
// TODO: Add command to create multiple bank accounts for users. Each account will be tied to a user, or be anonymous. Upon the creation of the bank account, the user will receive a pin code to use for transferring money and stuff.
// TODO: Add a trivia command with prizes maybe some fens or experience. The bot sends and embed with the questions and the answers. And the user reacts to the embed with the correct answer.

async function start() {
    try {
        await connectDB();
        await client.login(process.env.DISCORD_TOKEN);
        client.logger.info("Connected to discord!");
    } catch (error) {
        client.logger.fatal(error);
        client.destroy();
        process.exit(1);
    }
}

start();
