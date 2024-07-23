import express, { Request, Response } from 'express';
import { NotFoundError } from '@cit-psn/ticketing-common';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  const ticket = await Ticket.findById(id);
  if (!ticket || ticket === null) {
    throw new NotFoundError();
  }

  res.send(ticket);
});

export { router as showTicketRouter };
