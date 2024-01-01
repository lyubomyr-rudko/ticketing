import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";
import jwt from "jsonwebtoken";

process.env.STRIPE_KEY =
  "sk_test_51OTkmGBpcrRYFDKA8iz1NsON7LGKbSbsrdJqVfMslJBqG9geHGxk1l75sc9XUnAvllHocFQVahI5AivqgVc6I7fm00YDQjofiU";

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "as123df";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

declare global {
  var signin: (id?: string) => Promise<string[]>;
  var createMongooseId: () => string;
}

global.signin = async (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "asdf@asdf.com",
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const session = { jwt: token };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString("base64");

  return [`session=${base64}`];
};

global.createMongooseId = () => {
  return new mongoose.Types.ObjectId().toHexString();
};
