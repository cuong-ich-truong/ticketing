// Apply bootstrap css to all pages route

import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

type CurrentUser = {
  id: string;
  email: string;
};

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </>
  );
};

AppComponent.getInitialProps = async ({ Component, ctx }) => {
  const client = buildClient(ctx.req);

  const response = await client
    .get('/api/users/currentuser', {
      headers: ctx.req?.headers,
    })
    .catch((err) => {
      console.log(err.message);
    });

  const currentUser = (response?.data.currentUser as CurrentUser) ?? null;

  return { currentUser };
};

export default AppComponent;
