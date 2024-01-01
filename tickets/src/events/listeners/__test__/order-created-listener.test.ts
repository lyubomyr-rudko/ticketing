import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { OrderStatus } from "@lyubomyr.rudko/common";
import { Message } from "node-nats-streaming";

jest.mock("../../../nats-wrapper");

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);
  // Create and save a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 99,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  // Create the fake data event
  const data = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: "2023-10-10 10:10:10",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  // Create the fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

describe("Order created listener", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("sets the orderId of the ticket", async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
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

    expect(ticketUpdatedData.orderId).toEqual(data.id);
  });
});
