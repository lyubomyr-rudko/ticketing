import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

jest.mock("../../nats-wrapper");

it("returns an error if the order does not exist", async () => {
  const orderId = new mongoose.Types.ObjectId();

  await request(app)
    .get(`/api/orders/${orderId}`)
    .set("Cookie", await global.signin())
    .send()
    .expect(404);
});

it("returns an error if the user tries to fetch another user's order", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "title",
    price: 20,
    version: 0,
  });
  await ticket.save();

  const userOneCookie = await global.signin();
  const userTwoCookie = await global.signin();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOneCookie)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", userTwoCookie)
    .send()
    .expect(401);
});

it("fetches the order", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "title",
    price: 20,
    version: 0,
  });
  await ticket.save();

  const userCookie = await global.signin();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", userCookie)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", userCookie)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});
