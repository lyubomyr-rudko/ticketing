import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { OrderStatus } from "@lyubomyr.rudko/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

describe("New route", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it("returns a 404 if the order not found", async () => {
    const id = global.createMongooseId();

    await request(app)
      .post("/api/payments")
      .set("Cookie", await global.signin())
      .send({
        token: "asdf",
        orderId: id,
      })
      .expect(404);
  });

  it("returns a 401 if the user does not own the order", async () => {
    const order = Order.build({
      id: global.createMongooseId(),
      userId: global.createMongooseId(),
      version: 0,
      price: 20,
      status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
      .post("/api/payments")
      .set("Cookie", await global.signin())
      .send({
        token: "asdf",
        orderId: order.id,
      })
      .expect(401);
  });

  it("returns a 400 if the order is cancelled", async () => {
    const userId = global.createMongooseId();
    const order = Order.build({
      id: global.createMongooseId(),
      userId,
      version: 0,
      price: 20,
      status: OrderStatus.Cancelled,
    });
    await order.save();

    await request(app)
      .post("/api/payments")
      .set("Cookie", await global.signin(userId))
      .send({
        token: "asdf",
        orderId: order.id,
      })
      .expect(400);
  });

  it("returns a 201 with valid inputs", async () => {
    const userId = global.createMongooseId();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
      id: global.createMongooseId(),
      userId,
      version: 0,
      price,
      status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
      .post("/api/payments")
      .set("Cookie", await global.signin(userId))
      .send({
        token: "tok_visa",
        orderId: order.id,
      })
      .expect(201);

    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.data.find((charge) => {
      return charge.amount === price * 100;
    });

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual("usd");

    const payment = await Payment.findOne({
      orderId: order.id,
      stripeId: stripeCharge!.id,
    });

    expect(payment).not.toBeNull();
  });
});
