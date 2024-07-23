import Ticket from './ticket';

type Order = {
  id: string;
  userId: string;
  status: string;
  version: number;
  ticket: Ticket;
};

export default Order;
