import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent, OrderStatus } from "@lyubomyr.rudko/common";
import { Message } from "node-nats-streaming";

jest.mock("../../../nats-wrapper");

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);
  // Create and save a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 99,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  const orderId = new mongoose.Types.ObjectId().toHexString();
  ticket.set({ orderId });
  await ticket.save();

  // Create the fake data event
  const data: OrderCancelledEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 1,
    ticket: {
      id: ticket.id,
    },
  };

  // Create the fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

describe("Order cancelled listener", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("cleares the orderId of the ticket", async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(undefined);
  });

  it("acks the message", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });

  it("publishes a ticket updated event", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    expect((natsWrapper.client.publish as jest.Mock).mock.calls[0][0]).toEqual(
      "ticket:updated"
    );

    const ticketUpdatedData = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(ticketUpdatedData.orderId).toEqual(undefined);
  });
});
