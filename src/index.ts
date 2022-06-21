import "#lib/setup";
import { Client } from "#lib/structures/Client";
import { CLIENT_OPTIONS } from "#config";

const client = new Client(CLIENT_OPTIONS);
/**
 * TODO: Add premium system, add redeemable codes, add a way to get a code, add a way to generate codes.
 * TODO: Add a command that gives the selected role when reacting to the message from the bot.
 * TODO: Make a command `rewards` with the default being to see the rewards and maybe a subcommand `rewards list` which the command defaults to,
 * !and a subcommand `rewards add` which adds a reward, but only works for someone with `ADMINISTRATOR` or `MANAGE_GUILD` permissions.
 * TODO: Add a chance for people to get random titles at certain levels. Make the titles themselves be random, using lists of options.
 * TODO: Add command to re-give the role rewards to a user. Cooldown of 1 hour or maybe 1 day.
 * TODO: Add command to create multiple bank accounts for users. Each account will be tied to a user, or be anonymous.
 * !Upon the creation of the bank account, the user will receive a pin code to use for transferring money and stuff.
 * TODO: Add a trivia command with prizes maybe some fens or experience. The bot sends and embed with the questions and the answers. And the user reacts to the embed with the correct answer.
 * TODO: Make commands toggleable by making a preconditions that check if they are in an array for that server. Useful for disabling commands inside the dashboard.
 * TODO: Make the first page of the help command where it shows maybe some announcements/changelog and how to use the help command/bot.
 * TODO: Make command be able to be disabled in the dashboard. Use a precondition to check if the command is disabled in that guild. Show in the help command with 🟢 and 🔴.
 */

(async () => {
    try {
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        client.logger.fatal(error);
        client.destroy();
        process.exit(1);
    }
})();
