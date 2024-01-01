import { TicketCreatedEvent } from "@lyubomyr.rudko/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

jest.mock("../../../nats-wrapper");

const setup = async () => {
  const listener = new TicketCreatedListener(natsWrapper.client);

  const data: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  const msg: Message = {
    ack: jest.fn(),
  } as unknown as Message;

  // this will trigger the event listener, wich should create a ticket
  await listener.onMessage(data, msg);

  return { listener, data, msg };
};

it("creates and saves a ticket", async () => {
  const { data, msg } = await setup();

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);

  expect(msg.ack).toHaveBeenCalled();
});
