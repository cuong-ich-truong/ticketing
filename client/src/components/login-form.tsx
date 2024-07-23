import { useState } from 'react';

type LoginFormProps = {
  errors: JSX.Element | null;
  onSubmitCallback: (e: { email: string; password: string }) => void;
};

const LoginForm = ({ onSubmitCallback, errors }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmitHandler = (e) => {
    e.preventDefault();
    onSubmitCallback({ email, password });
  };

  return (
    <form onSubmit={onSubmitHandler}>
      <div className="mb-3">
        <label htmlFor="inputEmail" className="form-label">
          Email address
        </label>
        <input
          type="email"
          className="form-control"
          id="inputEmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="inputPassword" className="form-label">
          Password
        </label>
        <input
          type="password"
          className="form-control"
          id="inputPassword"
          aria-describedby="passwordHelp"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div id="passwordHelp" className="form-text">
          Password must be at least 4 characters long and maximum at 20
          characters
        </div>
      </div>
      {errors}
      <button type="submit" className="btn btn-primary">
        Sign Up
      </button>
    </form>
  );
};

export default LoginForm;
