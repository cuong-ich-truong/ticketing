import mongoose from 'mongoose';
import { OrderStatus } from '@cit-psn/ticketing-common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
  description?: string;
}

interface OrderDoc extends mongoose.Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
  description?: string;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
  findByEvent(event: { id: string; version: number }): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    chargeId: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.findByEvent = async function (event: {
  id: string;
  version: number;
}) {
  return await Order.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    ...attrs,
    _id: attrs.id,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
