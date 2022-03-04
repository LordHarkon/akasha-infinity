import mongoose from "mongoose";
import { Listener } from "@sapphire/framework";
import type { PieceContext } from "@sapphire/framework";
import { gray } from "colorette";

export default class MongoConnected extends Listener {
  public constructor(context: PieceContext) {
    super(context, {
      emitter: mongoose.connection,
    });
  }

  public async run() {
    this.container.logger.info(gray(`┌─ Connected to the database.`));
  }
}
