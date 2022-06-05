import mongoose from "mongoose";

export interface IStore {
    item: mongoose.Types.ObjectId;
    availableQuantity?: number;
    price: number;
    disabled?: boolean;
}

export type StoreDocument = IStore & mongoose.Document;

const StoreSchema = new mongoose.Schema<StoreDocument>({
    item: {
        type: mongoose.Schema.Types.ObjectId,
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

export default mongoose.model<StoreDocument>("Store", StoreSchema);
