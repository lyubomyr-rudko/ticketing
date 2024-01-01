import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

jest.mock("../../nats-wrapper");

it("fails if user is not authenticated", async () => {
  await request(app).get("/api/orders").send().expect(401);
});

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "title",
    price: 20,
    version: 0,
  });
  await ticket.save();

  return ticket;
};

it("fetches orders for a particular user", async () => {
  // create three tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOneCookie = await global.signin();
  const userTwoCookie = await global.signin();

  // create one order as User #1
  await request(app)
    .post("/api/orders")
    .set("Cookie", userOneCookie)
    .send({
      ticketId: ticketOne.id,
    })
    .expect(201);

  // create one order as User #2
  const { body: orderTwo } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwoCookie)
    .send({
      ticketId: ticketTwo.id,
    })
    .expect(201);

  const { body: orderThree } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwoCookie)
    .send({
      ticketId: ticketThree.id,
    });

  const ticketTwoId = orderTwo.ticket.id;
  const ticketThreeId = orderThree.ticket.id;

  // make request to get orders for User #2
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwoCookie)
    .expect(200);

  // make sure we only got the orders for User #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderTwo.id);
  expect(response.body[1].id).toEqual(orderThree.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwoId);
  expect(response.body[1].ticket.id).toEqual(ticketThreeId);
});
