import { Schema, model, Types, Document } from "mongoose";

interface User extends Document {
  id: string;
  guildId: string;
  username: string;
  avatar: string;
  power: {
    experience: number;
  };
  stats: {
    messages: number;
    games: {
      roulette: {
        played: number;
        won: number;
        lost: number;
        moneyWon: number;
        moneyLost: number;
      };
      slots: {
        played: number;
        won: number;
        lost: number;
        moneyWon: number;
        moneyLost: number;
      };
      rps: {
        played: number;
        won: number;
        lost: number;
      };
      rpsls: {
        played: number;
        won: number;
        lost: number;
      };
    };
  };
  bank: {
    money: number;
  };
  inventory: {
    items: [
      {
        item: Types.ObjectId;
        amount: number;
      },
    ];
    slots: number;
  };
  settings: {
    language: string;
    blacklist: Array<string>;
  };
  moderation: {
    warnings: [
      {
        id: string;
        reason: string;
        expires: Date;
        severity: number;
      },
    ];
    kicks: number;
    bans: number;
  };
}

const UserSchema = new Schema<User>({
  id: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    // required: true,
  },
  power: {
    // REMINDER? (hopefully): Level is calculated from the total experience
    experience: {
      type: Number,
      default: 0,
    },
  },
  stats: {
    messages: {
      type: Number,
      default: 0,
    },
    games: {
      roulette: {
        played: {
          type: Number,
          default: 0,
        },
        won: {
          type: Number,
          default: 0,
        },
        lost: {
          type: Number,
          default: 0,
        },
        moneyWon: {
          type: Number,
          default: 0,
        },
        moneyLost: {
          type: Number,
          default: 0,
        },
      },
      rps: {
        played: {
          type: Number,
          default: 0,
        },
        won: {
          type: Number,
          default: 0,
        },
        lost: {
          type: Number,
          default: 0,
        },
      },
      rpsls: {
        played: {
          type: Number,
          default: 0,
        },
        won: {
          type: Number,
          default: 0,
        },
        lost: {
          type: Number,
          default: 0,
        },
      },
      slots: {
        played: {
          type: Number,
          default: 0,
        },
        won: {
          type: Number,
          default: 0,
        },
        lost: {
          type: Number,
          default: 0,
        },
        moneyWon: {
          type: Number,
          default: 0,
        },
        moneyLost: {
          type: Number,
          default: 0,
        },
      },
    },
  },
  bank: {
    money: {
      type: Number,
      default: 0,
    },
  },
  inventory: {
    items: [
      {
        item: {
          type: Types.ObjectId,
          ref: "Item",
        },
        amount: {
          type: Number,
          default: 1,
        },
      },
    ],
    slots: {
      type: Number,
      // TODO: come back in the future and update this maybe?
      // TODO: add items that can expand the inventory size
      default: 10,
    },
  },
  settings: {
    language: {
      type: String,
      default: "en",
    },
    blacklist: {
      type: [String],
      default: [],
    },
  },
  moderation: {
    warnings: [
      {
        id: {
          type: String,
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
        expires: {
          type: Date,
        },
        severity: {
          type: Number,
          default: 0,
        },
      },
    ],
    kicks: {
      type: Number,
      default: 0,
    },
    bans: {
      type: Number,
      default: 0,
    },
  },
});

UserSchema.index({ id: 1, guildId: 1 }, { unique: true });

export default model<User>("User", UserSchema);
