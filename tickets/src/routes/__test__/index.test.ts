import request from "supertest";
import { app } from "../../app";

jest.mock("../../nats-wrapper");

const createTicketRouter = async () => {
  const cookie = await global.signin();
  return await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "title", price: 20 })
    .expect(201);
};

it("can fetch a list of tickets", async () => {
  await createTicketRouter();
  await createTicketRouter();
  await createTicketRouter();

  const response = await request(app).get("/api/tickets").send().expect(200);

  expect(response.body.length).toEqual(3);
});
