import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "123",
  });
  // Save the ticket to the database
  ticket.save();
  // Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });
  // Save the first fetched ticket
  await firstInstance!.save();

  try {
    // Save the second fetched ticket
    await secondInstance!.save();
  } catch (err) {
    // Expect an error
    return;
  }

  // Fail test if we get to this point
  expect(true).toBe(false);
});

it("increments the version number on multiple saves", async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "123",
  });
  // Save the ticket to the database
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
