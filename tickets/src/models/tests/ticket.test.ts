import { Ticket } from '../ticket';

describe('Ticket Model', () => {
  it('implements optimistic concurrency control', async () => {
    const ticket = Ticket.build({
      title: 'concert',
      price: 5,
      userId: '123',
    });
    await ticket.save();

    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    firstInstance!.set({ price: 10 });
    secondInstance!.set({ price: 15 });

    await firstInstance!.save();

    let expectedError: Error = new Error();
    try {
      await secondInstance!.save();
    } catch (error) {
      expectedError = error as Error;
    }

    expect(expectedError!.message).toEqual(
      `No matching document found for id "${secondInstance!.id}" version ${secondInstance!.version} modifiedPaths "price"`
    );
  });

  it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
      title: 'concert',
      price: 5,
      userId: '123',
    });
    await ticket.save();

    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
  });
});
