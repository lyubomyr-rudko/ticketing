import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

jest.mock("../../nats-wrapper");

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const cookie = await global.signin();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({
      title: "title",
      price: 20,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "title",
      price: 20,
    })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const res = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", await global.signin())
    .send({
      title: "title",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", await global.signin())
    .send({
      title: "title2",
      price: 30,
    })
    .expect(401);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual("title");
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = await global.signin();

  const res = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title: "title",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "title",
      price: -20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "title",
    })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const cookie = await global.signin();

  const res = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title: "title",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "title2",
      price: 30,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.price).toEqual(30);
  expect(ticketResponse.body.title).toEqual("title2");
});

it("publishes an event", async () => {
  const cookie = await global.signin();

  const res = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title: "title",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "title2",
      price: 30,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
  const cookie = await global.signin();

  const res = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title: "title",
      price: 20,
    });

  const ticket = await Ticket.findById(res.body.id);
  const orderId = new mongoose.Types.ObjectId().toHexString();
  ticket!.set({ orderId });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "title2",
      price: 30,
    })
    .expect(400);
});
