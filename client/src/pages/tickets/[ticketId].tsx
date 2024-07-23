import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import useRequest from '../../hooks/use-request';
import { Logger } from '../../utils/logger';
import Ticket from '../../models/ticket';
import buildClient from '../../api/build-client';

const ShowTicket = ({
  ticket,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    defaultBody: { ticketId: ticket.id },
    onSuccess: (order) => {
      router.push('/orders/[orderId]', `/orders/${order.id}`);
    },
  });

  return (
    <div>
      <h1>Show Ticket</h1>
      <div>
        <h2>{ticket.title}</h2>
        <h4>Ticket Price: ${ticket.price}</h4>
        {errors}
        <button onClick={() => doRequest()} className="btn btn-primary">
          Purchase
        </button>
      </div>
    </div>
  );
};

export const getServerSideProps = (async (context) => {
  const { ticketId } = context.query;

  const client = buildClient(context.req);
  const { data: ticket } = await client.get(`/api/tickets/${ticketId}`);
  Logger.log('ShowTicket.getServerSideProps: ticket', ticket);

  return { props: { ticket } };
}) satisfies GetServerSideProps<{
  ticket: Ticket;
}>;

export default ShowTicket;
