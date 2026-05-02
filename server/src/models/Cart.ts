import mongoose, { Schema, Document } from 'mongoose';
import { CART } from '../config/constants';

// ─── Interface ───

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number; // snapshot of price at time of add
}

export interface ICart extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───

const cartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [CART.MAX_QUANTITY_PER_ITEM, `Max ${CART.MAX_QUANTITY_PER_ITEM} per item`],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
      validate: {
        validator: (v: ICartItem[]) => v.length <= CART.MAX_ITEMS,
        message: `Cart cannot have more than ${CART.MAX_ITEMS} items`,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Model ───

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
