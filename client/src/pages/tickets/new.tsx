import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useRequest from '../../hooks/use-request';

const NewTicket = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    defaultBody: { title, price },
    onSuccess: () => {
      setTitle('');
      setPrice('');
      router.push('/');
    },
  });

  const onBlur = () => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      return;
    }
    setPrice(value.toFixed(2));
  };

  const onSubmit = async (e) => {
    const form = e.currentTarget;
    e.preventDefault();

    if (!form.checkValidity()) {
      e.stopPropagation();
    } else {
      await doRequest();
    }
    form.classList.add('was-validated');
  };

  return (
    <div>
      <h1>New Ticket</h1>
      <form onSubmit={onSubmit} noValidate>
        <div className="mb-3 input">
          <label className="form-label">Title</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="invalid-feedback">Title is required</div>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={onBlur}
            required
          />
          <div className="invalid-feedback">Price must be greater than 0</div>
        </div>
        {errors}
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default NewTicket;
