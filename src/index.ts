import connectDB from "#lib/database";
import "#lib/setup";
// import { LogLevel, SapphireClient } from "@sapphire/framework";
import { AkashaClient } from "#lib/structures/AkashaClient";

const client = new AkashaClient();

async function start() {
  try {
    client.logger.info("Logging in...");
    await client.login();
    client.logger.info("Logged in!");
    await connectDB();
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
}

start();
