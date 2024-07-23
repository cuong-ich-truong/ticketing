import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import buildClient from '../api/build-client';

type CurrentUser = {
  id: string;
  email: string;
};

export const getServerSideProps = (async ({ req }) => {
  const client = buildClient(req);
  const response = await client
    .get('/api/users/currentuser', {
      headers: req.headers,
    })
    .catch((err) => {
      console.log(err.message);
    });

  const currentUser = (response?.data.currentUser as CurrentUser) ?? null;

  return { props: { currentUser } };
}) satisfies GetServerSideProps<{ currentUser: CurrentUser }>;

const LandingPage = ({
  currentUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div className="container">
      <h1>Landing Page</h1>
      <span>
        {' '}
        {currentUser ? (
          <p>You are signed in as {currentUser.email}</p>
        ) : (
          <p>You are not signed in</p>
        )}
      </span>
      <p>Ticketing app is ready to go!</p>
    </div>
  );
};

export default LandingPage;
