import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/ticket-created-listener";
import { TicketUpdatedListener } from "./events/ticket-updated-listener";

const client = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

client.on("connect", () => {
  console.log("Client connected to NATS");

  client.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  new TicketUpdatedListener(client).listen();
  new TicketCreatedListener(client).listen();
});

process.on("SIGINT", () => client.close());
process.on("SIGTERM", () => client.close());

// NOTES:
// nats-test % k port-forward nats-depl-db4545d6-pw9n4  4222:4222
