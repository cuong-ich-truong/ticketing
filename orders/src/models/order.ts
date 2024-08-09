import { model, Schema, Model, Document } from 'mongoose';
import { TicketDoc } from './ticket';
import { OrderStatus } from '@cit-psn/ticketing-common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrderDoc extends Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;
}

interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new Schema(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: { type: Schema.Types.Date },
    version: { type: Schema.Types.Number, default: 0 },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
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

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order, OrderStatus };
