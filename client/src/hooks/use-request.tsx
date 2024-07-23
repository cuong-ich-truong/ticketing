'use client';

import axios from 'axios';
import { useState } from 'react';
import Errors from '../components/errors';

type UseRequestProps = {
  url: string;
  method: 'get' | 'post';
  defaultBody: any;
  onSuccess?: (any) => void;
};

type UseRequestReturn = {
  doRequest: (body?: any) => Promise<any>;
  errors: JSX.Element | null;
};

const useRequest = ({
  url,
  method,
  defaultBody,
  onSuccess,
}: UseRequestProps): UseRequestReturn => {
  const [errors, setErrors] = useState<JSX.Element | null>(null);

  const doRequest = async (body?: any) => {
    try {
      setErrors(null);
      const response = await axios[method](url, body ?? defaultBody);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      setErrors(<Errors errors={err.response.data.errors} />);
    }
  };

  return { doRequest, errors };
};

export default useRequest;
