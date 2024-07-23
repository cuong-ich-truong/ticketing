import useRequest from '../../hooks/use-request';
import { useRouter } from 'next/navigation';
import LoginForm from '../../components/login-form';

const Signin = () => {
  const router = useRouter();

  const { doRequest, errors } = useRequest({
    url: '/api/users/signin',
    method: 'post',
    defaultBody: {},
    onSuccess: () => router.push('/'),
  });

  const submitCallback = async (email: string, password: string) => {
    await doRequest({
      email,
      password,
    });
  };
  return (
    <div className="container-sm">
      <h1>Ticketing - Pages Route /Sign In</h1>
      <LoginForm
        errors={errors}
        onSubmitCallback={(e) => submitCallback(e.email, e.password)}
      />
    </div>
  );
};

export default Signin;
