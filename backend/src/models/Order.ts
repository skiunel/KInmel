import mongoose, { Schema, Document } from 'mongoose';
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentStatus,
} from '../config/constants';

// ─── Interfaces ───

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IDeliveryUpdate {
  status: OrderStatus;
  message: string;
  location?: string;
  updatedBy?: mongoose.Types.ObjectId;
  timestamp: Date;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingCost: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  notes?: string;
  deliveryUpdates: IDeliveryUpdate[];
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  blockchainCode?: string;
  blockchainTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ───

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
    sku: { type: String, required: true },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'Nepal' },
  },
  { _id: false }
);

const deliveryUpdateSchema = new Schema<IDeliveryUpdate>(
  {
    status: { type: String, enum: Object.values(ORDER_STATUSES), required: true },
    message: { type: String, required: true },
    location: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ─── Main Schema ───

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => v.length > 0,
        message: 'Order must have at least one item',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, required: true, default: 0.13 },
    taxAmount: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUSES),
      default: ORDER_STATUSES.PENDING,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUSES),
      default: PAYMENT_STATUSES.PENDING,
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'cod', // cash on delivery
    },
    notes: { type: String, maxlength: 500 },
    deliveryUpdates: {
      type: [deliveryUpdateSchema],
      default: [],
    },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
    blockchainCode: { type: String },
    blockchainTxHash: { type: String },
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

// ─── Indexes ───

orderSchema.index({ createdAt: -1 });

// ─── Statics ───

orderSchema.statics.generateOrderNumber = async function (): Promise<string> {
  const date = new Date();
  const prefix = `KNM-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const count = await this.countDocuments({
    orderNumber: { $regex: `^${prefix}` },
  });
  return `${prefix}-${String(count + 1).padStart(5, '0')}`;
};

// ─── Model ───

export const Order = mongoose.model<IOrder>('Order', orderSchema);
