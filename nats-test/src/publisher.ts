import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

const client = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

client.on("connect", async () => {
  console.log("Publisher connected to NATS");

  const publisher = new TicketCreatedPublisher(client);
  await publisher.publish({
    id: "123",
    title: "concert",
    price: 20,
  });
});

// nats-test % k get pods
// nats-test % k port-forward nats-depl-db4545d6-pw9n4  4222:4222
