import mongoose from "mongoose";

export interface ItemInterface {
    id: string;
    name: string;
    description: string;
    image?: string;
    category: string;
    levelRequired?: number;
    evalFunction?: string;
    sellable?: boolean;
    disabled?: boolean;
}

export type ItemDocument = ItemInterface & mongoose.Document;

const ItemSchema = new mongoose.Schema<ItemDocument>({
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
    levelRequired: {
        type: Number,
        default: 0,
    },
    evalFunction: {
        type: String,
    },
    sellable: {
        type: Boolean,
        default: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

export default mongoose.model<ItemDocument>("Item", ItemSchema);
