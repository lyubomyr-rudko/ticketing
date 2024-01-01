import mongoose from "mongoose";
// import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order, OrderStatus } from "./order";

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
  version: number;
}

export type TicketDoc = mongoose.Document &
  TicketAttrs & {
    createdAt: string;
    updatedAt: string;
    version: number;
    isReserved(): Promise<boolean>;
  };

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.statics.build = ({ id, ...attrs }: TicketAttrs) => {
  return new Ticket({
    _id: id,
    ...attrs,
  });
};
ticketSchema.statics.findByEvent = ({
  id,
  version,
}: Parameters<TicketModel["findByEvent"]>[0]): ReturnType<
  TicketModel["findByEvent"]
> => {
  return Ticket.findOne({
    _id: id,
    version: version - 1,
  });
};
ticketSchema.methods.isReserved = async function () {
  const orderForThisTicket = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!orderForThisTicket;
};

// ticketSchema.plugin(updateIfCurrentPlugin);
ticketSchema.set("versionKey", "version");
ticketSchema.pre("save", function (done) {
  this.$where = {
    version: this.get("version") - 1,
  };
  done();
});

export const Ticket = mongoose.model<TicketDoc, TicketModel>(
  "Ticket",
  ticketSchema
);
