import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { Logger } from '../utils/logger';
import buildClient from '../api/build-client';
import Link from 'next/link';
import Ticket from '../models/ticket';

export const getServerSideProps = (async (context) => {
  const client = buildClient(context.req);
  let tickets = [];
  // await client
  //   .get('/api/tickets')
  //   .then((response) => {
  //     tickets = response.data;
  //     Logger.log('LandingPage.getServerSideProps: tickets', tickets);
  //   })
  //   .catch((error) => {
  //     Logger.error('LandingPage.getServerSideProps: error', error);
  //   });

  return {
    props: {
      tickets: tickets,
    },
  };
}) satisfies GetServerSideProps<{
  tickets: Ticket[];
}>;

const LandingPage = ({ currentUser, tickets }) => {
  const ticketsTable = (tickets: Ticket[]) => {
    return (
      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Price</th>
            <th scope="col">Link</th>
          </tr>
        </thead>
        <tbody>
          {tickets &&
            tickets.map((ticket: Ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                  <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container">
      <h1>Welcome to Ticketing</h1>
      <span>
        {' '}
        {currentUser ? (
          <p>You are signed in as {currentUser.email}</p>
        ) : (
          <p>You are not signed in</p>
        )}
      </span>
      <p>Ticketing app is ready to go!</p>
      {ticketsTable(tickets)}
    </div>
  );
};

export default LandingPage;
