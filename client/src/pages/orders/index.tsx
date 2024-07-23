import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import buildClient from '../../api/build-client';
import Order from '../../models/order';
import { Logger } from '../../utils/logger';

const ListOrders = ({
  orders,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const orderTable = (orders: Order[]) => {
    return (
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Price</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders &&
            orders.map((order: Order) => (
              <tr key={order.id}>
                <td>{order.ticket.title}</td>
                <td>${order.ticket.price}</td>
                <td>{order.status}</td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <h1>My Orders</h1>
      {orderTable(orders)}
    </div>
  );
};

export const getServerSideProps = (async (context) => {
  const client = buildClient(context.req);
  const { data: orders } = await client.get(`/api/orders`);
  Logger.log('ListOrders.getServerSideProps: orders', orders);

  return { props: { orders: orders } };
}) satisfies GetServerSideProps<{
  orders: Order[];
}>;

export default ListOrders;
