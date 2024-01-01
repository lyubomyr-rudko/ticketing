import request from "supertest";
import { app } from "../../app";

it("return 400 when email does not exist", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com", password: "password" })
    .expect(400);
});

it("return 400 when password is incorrect", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201); // 201 - Created

  await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com", password: "adsf" })
    .expect(400);
});

it("return 200 and a cookie when signin is successful", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com", password: "password" })
    .expect(200); // 200 - OK

  expect(response.get("Set-Cookie")).toBeDefined();
});
