import { Schema, model, Document } from "mongoose";

export interface IStore {
    item: Schema.Types.ObjectId;
    availableQuantity?: number;
    price: number;
    disabled?: boolean;
}

export type StoreDocument = IStore & Document;

const StoreSchema = new Schema<StoreDocument>({
    item: {
        type: Schema.Types.ObjectId,
        ref: "Item",
        required: true,
        unique: true,
    },
    availableQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

export default model<StoreDocument>("Store", StoreSchema);
