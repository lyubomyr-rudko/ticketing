import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@lyubomyr.rudko/common";
import { Message } from "node-nats-streaming";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

jest.mock("../../../nats-wrapper");

const setup = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "title",
    price: 20,
    version: 0,
  });
  await ticket.save();

  const listener = new TicketUpdatedListener(natsWrapper.client);

  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: 1,
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  const msg: Message = {
    ack: jest.fn(),
  } as unknown as Message;

  // this will trigger the event listener, wich should update a ticket
  await listener.onMessage(data, msg);

  return { listener, data, msg, ticket };
};

it("Updates a ticket", async () => {
  const { data, msg } = await setup();

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
  expect(ticket!.version).toEqual(data.version);

  expect(msg.ack).toHaveBeenCalled();
});

it("handles version conflicts", async () => {
  const { data, msg, listener } = await setup();

  data.version = 20;
  msg.ack = jest.fn();

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
