import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201); // 201 is the status code for a successful post request
});

it("returns a 400 with an invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "testtest.com", password: "password" })
    .expect(400); // 400 is the status code for a bad request
});

it("returns a 400 with an invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "testtest.com", password: "p" })
    .expect(400); // 400 is the status code for a bad request
});

it("returns a 400 with missing email and password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "testtest.com" })
    .expect(400); // 400 is the status code for a bad request

  await request(app)
    .post("/api/users/signup")
    .send({ password: "password" })
    .expect(400); // 400 is the status code for a bad request
});

it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201); // 201 is the status code for a successful post request

  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(400); // 400 is the status code for a bad request
});

it("sets a cookie after successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201); // 201 is the status code for a successful post request

  expect(response.get("Set-Cookie")).toBeDefined();
});
