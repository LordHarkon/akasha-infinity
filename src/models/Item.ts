import { Schema, model, Document } from "mongoose";

interface Item extends Document {
  id: string;
  name: string;
  description: string;
  image?: string;
  category: string;
  evalFunction?: string;
}

const ItemSchema = new Schema<Item>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  evalFunction: {
    type: String,
  },
});

export default model<Item>("Item", ItemSchema);
