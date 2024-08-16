// Apply bootstrap css to all pages route

import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';
import { Logger } from '../utils/logger';
import User from '../models/user';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </>
  );
};

AppComponent.getInitialProps = async ({ Component, ctx }) => {
  const client = buildClient(ctx.req);

  // const response = await client
  //   .get('/api/users/currentuser', {
  //     headers: ctx.req?.headers,
  //   })
  //   .catch((err) => {
  //     console.log(err.message);
  //   });

  // const user = (response?.data.currentUser as User) ?? null;
  const user = null;
  Logger.log('AppComponent.getInitialProps: user', user);

  return { currentUser: user };
};

export default AppComponent;
