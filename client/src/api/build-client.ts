import axios from 'axios';

const buildClient = (req) => {
  if (typeof window === 'undefined') {
    // const baseURL = 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local';
    // We are on the server
    return axios.create({
      baseURL: 'http://www.citticketing.ddns.net/',
      headers: req.headers,
    });
  } else {
    // We must be on the browser
    return axios.create({
      baseURL: '/',
    });
  }
};

export default buildClient;
