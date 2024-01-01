import { Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"];
  private client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  publish(data: T["data"]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }

        console.log("Event published to subject", this.subject);
        resolve();
      });
    });
  }
}

// const client = nats.connect("ticketing", "abc", {
//   url: "http://localhost:4222",
// });

// client.on("connect", () => {
//   console.log("Publisher connected to NATS");

//   const data = JSON.stringify({
//     id: "123",
//     title: "concert",
//     price: 20,
//   });

//   client.publish("ticket:created", data, () => {
//     console.log("Event published");
//   });
// });
